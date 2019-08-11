function [quat_curr_prev] = quaternionFromGyr(gyr, rate)
%QUATERNIONFROMGYR Create a quaternion from a gyroscope sample.
    
    gyrNorm = norm(gyr);
    
    if gyrNorm<1e-10,
        quat_curr_prev=[1 0 0 0];
    else
        %% <task 3.2.2 part 2>
        axis = [1 0 0]; %TODO
        angle = 0; % TODO
        quat_curr_prev = [cos(0) axis*sin(0)]; % TODO
        %% <sol>
        axis = gyr/gyrNorm;
        angle = gyrNorm/rate;
        quat_curr_prev = [cos(angle/2) axis*sin(angle/2)];
        %% </sol>
        %% </task 3.2.2 part 2>
    end
end

