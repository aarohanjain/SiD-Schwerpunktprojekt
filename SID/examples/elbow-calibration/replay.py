#!/usr/bin/env python3
import asyncio
import gzip

import sys

import ujson
import websockets
import time
import datetime
import pprint
from csg_bigdata.dp.quaternion import Quaternion, multiplyQuat, relativeQuat, quatRotate, quatTransform
from csg_bigdata.onlinedp.core import OnlineDP, FileDataSource, Block, MovingAverageBlock, OriEstIMUBlock, PARAM_LIST, RingBuffer
from csg_bigdata.onlinedp.papidatasource import PapiDataSource
from csg_bigdata.dp.utils import wrapToPi
from csg_bigdata.dp.magcalib import calibrateMagnetometer
from collections import defaultdict
import numpy as np
import inspect

import logging

RATE = 50


class ReplayDataSource:
    def __init__(self, filename, startPaused=False, loop=False):
        
        self.filename = filename
        self.loop = loop
        self.openFile(startPaused)
        
    def openFile(self, startPaused):
        if self.filename.endswith('.gz'):
            self.f = gzip.open(self.filename, 'rt')
        else:
            self.f = open(self.filename, 'r')
        self.startT = time.time()
        self.pauseT = 0
        self.pauseStartT = self.startT

        #for i in range(RATE*440):
            #next(self.f)

        self.next = ujson.loads(next(self.f))
        self.fileStartT = self.next[0]['t']
        self._paused = bool(startPaused)

    def getSample(self):  # TODO: add some timeout mechanism for blocking reads
        if self._paused:
            return None
        if self.next is not None and time.time()-self.startT-self.pauseT > self.next[0]['t'] - self.fileStartT:
            sample = {k: self._toArray(v) for k, v in self.next[1].items()}
            try:
                self.next = ujson.loads(next(self.f))
            except StopIteration:
                print('end of data file.')
                if self.loop:
                    print('reloading file')
                    self.openFile(False)
                else:
                    self.next = None
            return sample
        return None

    def isInitialized(self):
        return True

    def stop(self):
        pass

    @staticmethod
    def getArgs():
        return [
            {
                'name': 'filename',
                'type': 'str',
                'value': '',
            },
            {
                'name': 'startPaused',
                'type': 'bool',
                'value': False,
            },
        ]

    def getParams(self):
        return [{'name': 'paused', 'type': 'bool', 'value': self._paused}]

    def setParam(self, name, value):
        assert name == 'paused'
        self.setPaused(bool(value))

    def setPaused(self, paused):
        paused = bool(paused)
        if self._paused == paused:
            return
        if self._paused:
            self.pauseT += time.time() - self.pauseStartT
            self._paused = False
        else:
            self.pauseStartT = time.time()
            self._paused = True

    @staticmethod
    def _toArray(v):
        return v if np.isscalar(v) else np.asarray(v)


def createBlocks(rate):
    blocks = [
    ]
    return blocks


async def receiveHandler(onlinedp, websocket):
    while True:
        message = await websocket.recv()
        print('received msg:', message)
        message = ujson.loads(message)
        # if isinstance(message, list) and len(message) == 2:
        #     onlinedp.sendCommand(message[0], message[1])
        # else:
        #     print('unknown message format:', message)


async def sendHandler(onlinedp, websocket):
    i = 0
    while True:
        rawSample, sample, parameters = onlinedp.getSample()
        if sample is None:
            await asyncio.sleep(0.01)
        elif sample is PARAM_LIST:
            print('got param list', parameters)
        else:
            # print('SEND', i, sample['t'])
            try:
                message = ujson.dumps(sample)
            except OverflowError as e:
                print('encoding message message failed:', e)
                pprint.pprint(sample)
                message = ''
            if i % 200 == 0:
                print('sending...', sample['t'])
                # pprint.pprint(sample)
            i += 1
            await websocket.send(message)


connected = False

async def handler(onlinedp, websocket, path):
    global connected
    assert not connected

    connected = True
    print('connected')
    try:
        receiver = asyncio.ensure_future(receiveHandler(onlinedp, websocket))
        sender = asyncio.ensure_future(sendHandler(onlinedp, websocket))
        done, pending = await asyncio.wait(
            [receiver, sender],
            return_when=asyncio.FIRST_COMPLETED,
        )

        for task in pending:
            task.cancel()

        for task in done:  # makes sure that connection closed exception is raised
            await task

    except websockets.exceptions.ConnectionClosed as e:
        print('disconnected:', e)
    finally:
        connected = False


async def eatSamples(onlinedp):
    """Receives samples from onlinedp when no client is connected."""
    global connected

    while True:
        if connected:
            await asyncio.sleep(0.2)
            continue

        rawSample, sample, parameters = onlinedp.getSample()
        # print('eat')
        if sample is None:
            await asyncio.sleep(0.01)


def main():
    logging.basicConfig(level=logging.DEBUG, format=' %(asctime)s - %(name)s - %(levelname)s - %(message)s',
                        handlers=[logging.StreamHandler()])
    logger = logging.getLogger('websockets.server')
    logger.setLevel(logging.ERROR)
    # logger.addHandler(logging.StreamHandler())
    logger = logging.getLogger('websockets.protocol')
    logger.setLevel(logging.ERROR)
    # logger.addHandler(logging.StreamHandler())

    if len(sys.argv) == 2:
        filename = sys.argv[1]
    elif len(sys.argv) == 1:
        filename = '2017-06-22_17-59-54_cut.jsonl.gz'
    else:
        raise RuntimeError('invalid number of arguments')
    
    onlinedp = OnlineDP(RATE, ReplayDataSource, {'filename': filename, 'loop': True}, createBlocks)

    onlinedp.requestParams()

    asyncio.ensure_future(eatSamples(onlinedp))

    async def h(websocket, path):
        await handler(onlinedp, websocket, path)

    start_server = websockets.serve(h, 'localhost', 9999)
    print('Server Started! Connect with a client ...')

    asyncio.get_event_loop().run_until_complete(start_server)
    asyncio.get_event_loop().run_forever()

if __name__ == '__main__':
    main()
