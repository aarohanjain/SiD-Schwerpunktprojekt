function [q_t, disagreement_angle, corr_angle] = quaternionSlerp(q0, q1, t)
%QUATERNIONSLERP Quaternion spherical linear interpolation
%   Return interpolated quaternion between q1 (t=0) and q2 (t=1)
    disagreement_angle=0;
    corr_angle=0;
    q_2_1 = quaternionMultiply(quaternionInvert(q0), q1);
    
    % normalize the quaternion for positive w component to ensure
    % that the angle will be [0, 180°]
    if q_2_1(1) < 0
        q_2_1 = -q_2_1;
    end
    
    % check if q_2_1 is zero-rotation
    if abs(q_2_1(1))>=1
        q_t=q0;
    else
        disagreement_angle = 2*acos(q_2_1(1));
        if disagreement_angle == 0
            q_t = q0;
            return;
        end

        corr_angle = t.*disagreement_angle;
        axis = q_2_1(2:4) / norm(q_2_1(2:4));
        q_t_1 = [cos(corr_angle/2) sin(corr_angle/2)*axis];
        q_t = quaternionMultiply(q0, q_t_1);
    end
end

