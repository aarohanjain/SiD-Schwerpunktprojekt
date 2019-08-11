function maxdist=distance(y,y_last)
maxdist=max( (sum((y-y_last).^2,2)).^0.5 );