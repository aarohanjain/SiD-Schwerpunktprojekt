
/*
 * Include Files
 *
 */
#if defined(MATLAB_MEX_FILE)
#include "tmwtypes.h"
#include "simstruc_types.h"
#else
#include "rtwtypes.h"
#endif



/* %%%-SFUNWIZ_wrapper_includes_Changes_BEGIN --- EDIT HERE TO _END */
#include <math.h>
/* %%%-SFUNWIZ_wrapper_includes_Changes_END --- EDIT HERE TO _BEGIN */
#define u_width 6
#define y_width 1

/*
 * Create external references here.  
 *
 */
/* %%%-SFUNWIZ_wrapper_externs_Changes_BEGIN --- EDIT HERE TO _END */
/* extern double func(double a); */
/* %%%-SFUNWIZ_wrapper_externs_Changes_END --- EDIT HERE TO _BEGIN */

/*
 * Output functions
 *
 */
void QC_Outputs_wrapper(const real_T *u,
			real_T *y,
			const real_T *xD,
			const real_T *Ad, const int_T p_width0,
			const real_T *Bd, const int_T p_width1,
			const real_T *Cd, const int_T p_width2,
			const real_T *Dd, const int_T p_width3)
{
/* %%%-SFUNWIZ_wrapper_Outputs_Changes_BEGIN --- EDIT HERE TO _END */
/* This sample sets the output equal to the input
      y0[0] = u0[0]; 
 For complex signals use: y0[0].re = u0[0].re; 
      y0[0].im = u0[0].im;
      y1[0].re = u1[0].re;
      y1[0].im = u1[0].im;
 */

y[0]=xD[0];
y[1]=xD[1];
y[2]=xD[2];
y[3]=xD[3];
y[4]=xD[4];
y[5]=xD[5];
y[6]=xD[6];
y[7]=xD[7];
y[8]=xD[8];
y[9]=xD[9];
y[10]=xD[10];
y[11]=xD[11];
/* %%%-SFUNWIZ_wrapper_Outputs_Changes_END --- EDIT HERE TO _BEGIN */
}

/*
 * Updates function
 *
 */
void QC_Update_wrapper(const real_T *u,
			real_T *y,
			real_T *xD,
			const real_T *Ad, const int_T p_width0,
			const real_T *Bd, const int_T p_width1,
			const real_T *Cd, const int_T p_width2,
			const real_T *Dd, const int_T p_width3)
{
/* %%%-SFUNWIZ_wrapper_Update_Changes_BEGIN --- EDIT HERE TO _END */
/*
 * Code example
 *   xD[0] = u0[0];
 */

real_T tempX[13]={0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0};
        
        tempX[0] = Ad[0]*xD[0] + Ad[13]*xD[1] + Ad[26]*xD[2] + Ad[39]*xD[3] + Ad[52]*xD[4] + Ad[65]*xD[5] + Ad[78]*xD[6] + Ad[91]*xD[7] + Ad[104]*xD[8] + Ad[117]*xD[9] + Ad[130]*xD[10] + Ad[143]*xD[11] + Bd[0]*u[0] + Bd[13]*u[1] + Bd[26]*u[2] + Bd[39]*u[3] + Bd[52]*u[4] + Bd[65]*u[5];
        tempX[1] = Ad[1]*xD[0] + Ad[14]*xD[1] + Ad[27]*xD[2] + Ad[40]*xD[3] + Ad[53]*xD[4] + Ad[66]*xD[5] + Ad[79]*xD[6] + Ad[92]*xD[7] + Ad[105]*xD[8] + Ad[118]*xD[9] + Ad[131]*xD[10] + Ad[144]*xD[11] + Bd[1]*u[0] + Bd[14]*u[1] + Bd[27]*u[2] + Bd[40]*u[3] + Bd[53]*u[4] + Bd[66]*u[5];
        tempX[2] = Ad[2]*xD[0] + Ad[15]*xD[1] + Ad[28]*xD[2] + Ad[41]*xD[3] + Ad[54]*xD[4] + Ad[67]*xD[5] + Ad[80]*xD[6] + Ad[93]*xD[7] + Ad[106]*xD[8] + Ad[119]*xD[9] + Ad[132]*xD[10] + Ad[145]*xD[11] + Bd[2]*u[0] + Bd[15]*u[1] + Bd[28]*u[2] + Bd[41]*u[3] + Bd[54]*u[4] + Bd[67]*u[5];
        tempX[3] = Ad[3]*xD[0] + Ad[16]*xD[1] + Ad[29]*xD[2] + Ad[42]*xD[3] + Ad[55]*xD[4] + Ad[68]*xD[5] + Ad[81]*xD[6] + Ad[94]*xD[7] + Ad[107]*xD[8] + Ad[120]*xD[9] + Ad[133]*xD[10] + Ad[146]*xD[11] + Bd[3]*u[0] + Bd[16]*u[1] + Bd[29]*u[2] + Bd[42]*u[3] + Bd[55]*u[4] + Bd[68]*u[5];
        tempX[4] = Ad[4]*xD[0] + Ad[17]*xD[1] + Ad[30]*xD[2] + Ad[43]*xD[3] + Ad[56]*xD[4] + Ad[69]*xD[5] + Ad[82]*xD[6] + Ad[95]*xD[7] + Ad[108]*xD[8] + Ad[121]*xD[9] + Ad[134]*xD[10] + Ad[147]*xD[11] + Bd[4]*u[0] + Bd[17]*u[1] + Bd[30]*u[2] + Bd[43]*u[3] + Bd[56]*u[4] + Bd[69]*u[5];
        tempX[5] = Ad[5]*xD[0] + Ad[18]*xD[1] + Ad[31]*xD[2] + Ad[44]*xD[3] + Ad[57]*xD[4] + Ad[70]*xD[5] + Ad[83]*xD[6] + Ad[96]*xD[7] + Ad[109]*xD[8] + Ad[122]*xD[9] + Ad[135]*xD[10] + Ad[148]*xD[11] + Bd[5]*u[0] + Bd[18]*u[1] + Bd[31]*u[2] + Bd[44]*u[3] + Bd[57]*u[4] + Bd[70]*u[5];
        tempX[6] = Ad[6]*xD[0] + Ad[19]*xD[1] + Ad[32]*xD[2] + Ad[45]*xD[3] + Ad[58]*xD[4] + Ad[71]*xD[5] + Ad[84]*xD[6] + Ad[97]*xD[7] + Ad[110]*xD[8] + Ad[123]*xD[9] + Ad[136]*xD[10] + Ad[149]*xD[11] + Bd[6]*u[0] + Bd[19]*u[1] + Bd[32]*u[2] + Bd[45]*u[3] + Bd[58]*u[4] + Bd[71]*u[5];
        tempX[7] = Ad[7]*xD[0] + Ad[20]*xD[1] + Ad[33]*xD[2] + Ad[46]*xD[3] + Ad[59]*xD[4] + Ad[72]*xD[5] + Ad[85]*xD[6] + Ad[98]*xD[7] + Ad[111]*xD[8] + Ad[124]*xD[9] + Ad[137]*xD[10] + Ad[150]*xD[11] + Bd[7]*u[0] + Bd[20]*u[1] + Bd[33]*u[2] + Bd[46]*u[3] + Bd[59]*u[4] + Bd[72]*u[5];
        tempX[8] = Ad[8]*xD[0] + Ad[21]*xD[1] + Ad[34]*xD[2] + Ad[47]*xD[3] + Ad[60]*xD[4] + Ad[73]*xD[5] + Ad[86]*xD[6] + Ad[99]*xD[7] + Ad[112]*xD[8] + Ad[125]*xD[9] + Ad[138]*xD[10] + Ad[151]*xD[11] + Bd[8]*u[0] + Bd[21]*u[1] + Bd[34]*u[2] + Bd[47]*u[3] + Bd[60]*u[4] + Bd[73]*u[5];
        tempX[9] = Ad[9]*xD[0] + Ad[22]*xD[1] + Ad[35]*xD[2] + Ad[48]*xD[3] + Ad[61]*xD[4] + Ad[74]*xD[5] + Ad[87]*xD[6] + Ad[100]*xD[7] + Ad[113]*xD[8] + Ad[126]*xD[9] + Ad[139]*xD[10] + Ad[152]*xD[11] + Bd[9]*u[0] + Bd[22]*u[1] + Bd[35]*u[2] + Bd[48]*u[3] + Bd[61]*u[4] + Bd[74]*u[5];
        tempX[10] = Ad[10]*xD[0] + Ad[23]*xD[1] + Ad[36]*xD[2] + Ad[49]*xD[3] + Ad[62]*xD[4] + Ad[75]*xD[5] + Ad[88]*xD[6] + Ad[101]*xD[7] + Ad[114]*xD[8] + Ad[127]*xD[9] + Ad[140]*xD[10] + Ad[153]*xD[11] + Bd[10]*u[0] + Bd[23]*u[1] + Bd[36]*u[2] + Bd[49]*u[3] + Bd[62]*u[4] + Bd[75]*u[5];
        tempX[11] = Ad[11]*xD[0] + Ad[24]*xD[1] + Ad[37]*xD[2] + Ad[50]*xD[3] + Ad[63]*xD[4] + Ad[76]*xD[5] + Ad[89]*xD[6] + Ad[102]*xD[7] + Ad[115]*xD[8] + Ad[128]*xD[9] + Ad[141]*xD[10] + Ad[154]*xD[11] + Bd[11]*u[0] + Bd[24]*u[1] + Bd[37]*u[2] + Bd[50]*u[3] + Bd[63]*u[4] + Bd[76]*u[5];
        tempX[12] = Ad[12]*xD[0] + Ad[25]*xD[1] + Ad[38]*xD[2] + Ad[51]*xD[3] + Ad[64]*xD[4] + Ad[77]*xD[5] + Ad[90]*xD[6] + Ad[103]*xD[7] + Ad[116]*xD[8] + Ad[129]*xD[9] + Ad[142]*xD[10] + Ad[155]*xD[11] + Bd[12]*u[0] + Bd[25]*u[1] + Bd[38]*u[2] + Bd[51]*u[3] + Bd[64]*u[4] + Bd[77]*u[5] + Ad[168]*xD[12];
        
        xD[0]=tempX[0];
        xD[1]=tempX[1];
        xD[2]=tempX[2];
        xD[3]=tempX[3];
        xD[4]=tempX[4];
        xD[5]=tempX[5];
        xD[6]=tempX[6];
        xD[7]=tempX[7];
        xD[8]=tempX[8];
        xD[9]=tempX[9];
        xD[10]=tempX[10];
        xD[11]=tempX[11];
        xD[12]=tempX[12];
/* %%%-SFUNWIZ_wrapper_Update_Changes_END --- EDIT HERE TO _BEGIN */
}


