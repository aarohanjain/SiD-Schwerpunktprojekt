function [quat_imu_earth] = quaternionFromAccMag(acc, mag)
%QUATERNIONFROMACCMAG Orientation quaternion from gravity and magnetic
%field vector. z of the reference frame points vertically up and x points
%horizontally north.

    %% <task 3.2.1>
    z_earth_imu = [0 0 1]; % TODO
    y_earth_imu = [0 1 0]; % TODO
    x_earth_imu = [1 0 0]; % TODO
    %% <sol>
    z_earth_imu = acc/norm(acc);
    y_earth_imu = cross(z_earth_imu, mag);
    y_earth_imu = y_earth_imu/norm(y_earth_imu);
    x_earth_imu = cross(y_earth_imu, z_earth_imu);
    %% </sol>
    %% </task 3.2.1>
	quat_imu_earth = quaternionFromRotmat([x_earth_imu' y_earth_imu' z_earth_imu']');
end

