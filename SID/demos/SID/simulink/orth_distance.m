function maxdist=orth_distance(y,y_last,y_seclast)

dist = zeros(6,1);

for i=1:6
    AB      = y_last(i,:)-y_seclast(i,:);    
    if norm(AB)>0
        ABnormd = AB/norm(AB);
        BC      = y(i,:)-y_last(i,:);
        BCproj  = BC-ABnormd*(BC*ABnormd');
        dist(i) = norm(BCproj);
    else
        dist(i) = norm(y(i,:)-y_last(i,:));
    end
end

maxdist=max(dist);
% maxdist=max( (sum((y-y_last).^2,2)).^0.5 + (sum((y-y_seclast).^2,2)).^0.5);