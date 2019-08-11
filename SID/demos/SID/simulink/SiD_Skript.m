% Projekt: SiD
% Autoren: Jan-Philip Wirsching, Aarohan Jain
% Betreuer: Dr. Ing Thomas Seel, Karsten Eckhoff
% Sommersemester 2019
% 05.08.2019

% Skript zum diskreten Reglerentwurf
% Matrizen Ad,Bd,Cd,Dd beschreiben das Verhalten des Systems
% 2 Referenzen eingestellt um den Regler zu pruefen

clear; clc

Ts = 0.04; % Abtastzeit

Ax = 0.25; % Luftwiderstaende
Ay = 0.25;
Az = 0.25;

b = 1.14e-7; % Auftriebswiderstand
k = 2.97e-6; % Luftwiderstand
g = 9.81;    % Gravitation
l = 0.175;    % QC-Radius

Ixx = 0.00497; % Traegheit um x,y,z Achsen
Iyy = 0.0055;
Izz = 0.01;

% Entwurf kontinuierlicher Matrizen
A = zeros(13,13); 
A(1,2) = 1;
A(3,4) = 1;
A(5,6) = 1;
A(7,8) = 1;
A(8,1) = Ax;
A(9,10) = 1;
A(10,3) = Ay;
A(11,12) = 1;
A(12,5) = Az;
A(12,13) = -g;

B = zeros(13,4); 
B(2,2) = -l*k/Ixx;
B(2,4) = l*k/Ixx;
B(4,1) = -l*k/Iyy;
B(4,3) = l*k/Iyy;
B(6,1) = b/Izz;
B(6,2) = -b/Izz;
B(6,3) = b/Izz;
B(6,4) = -b/Izz;
B(12,1) = k; 
B(12,2) = k;
B(12,3) = k;
B(12,4) = k;

C = zeros(6,13);
C(1,1) = 1;
C(2,3) = 1;
C(3,5) = 1;
C(4,7) = 1;
C(5,9) = 1;
C(6,11) = 1;

D = zeros(6,4);


% Polvorgabe
P = [-2+2i -2-2i -2 -2 -4 -4 -5 -5 -8 -8 -3 -3 0];
K = place(A,B,P);

G = -pinv(B)*(A - B*K)*pinv(C);

Anew = A-B*K;
Bnew = B*G;

% Diskretisierung
Ad=zeros(13,13);
for i=0:100
    Ad=Ad+Anew^i*Ts^i/factorial(i);
end
Bd = pinv(Anew)*(Ad-eye(13))*Bnew;
Cd = C;
Dd = 0;

% Referenzweg (Kreis an einer Hoehe)
t = 0:Ts:20;
x = zeros(length(t), 13);
x(1,:) = [0 0 0 0 0 0 0 0 0 0 0 0 1]; % Zustaende
ref = [zeros(length(t),3) 8*sin(2*pi*t/10)' 8*cos(2*pi*t/10)' 1*ones(length(t),1)];

for i = 2 : length(t)
    x(i,:) = (Ad*x(i-1,:)' + Bd*ref(i,:)')'; % Dynamik
end

figure(1);

plot(t, x(:,11), 'LineWidth', 1)
hold on
plot(t, ones(size(t)), '--', 'LineWidth', 1)
xlabel('Zeit [s]', 'FontSize', 18);
ylabel('Hoehe [m]', 'FontSize', 18);
set(gca,'FontSize',18);
legend('QC-Hoehe','Referenz')
grid on;
figure(2);
plot3(x(:,7),x(:,9),x(:,11),'LineWidth', 1)
hold on
plot3(8*sin(2*pi*t/10), 8*cos(2*pi*t/10), ones(length(t), 1), '--', 'LineWidth', 1)
box on
ax=gca;
ax.ZGrid='on';
ax.XGrid='on';
ax.YGrid='off';
xlabel('x-Position [m]');
ylabel('y-Position [m]');
zlabel('z-Position [m]');
set(gca,'FontSize',12);
legend('Flugbahn', 'Referenz');

figure(3);
plot(t,x(:,1),t,x(:,3),t,x(:,5), 'LineWidth', 1);
grid on;
xlabel('Zeit [s]');
ylabel('Winkel [°]');
set(gca,'FontSize',18);
legend('Roll (\phi)','Pitch (\Theta)','Yaw (\psi)')