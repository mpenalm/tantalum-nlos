clf
csv_files = dir('*.csv');
mkdir('output')
dt = 0.003;
m2ps = 1e12/3e8;
NPHOTONS = [5e3 5e4 5e5]; % total photon count
sp_r = numel(csv_files);
sp_c = 2+numel(NPHOTONS);
FWHM = 0.05; % 1.5 cm = 50 ps
sigma = FWHM/(4*sqrt(2*log(2))); 
    
t_m = (1:Nt)*dt;
t_m = t_m-t_m(end)/2;
t_ps = t_m*m2ps;

f_g = exp(-((t_m/2).^2)./(2*(sigma.^2)));
x = 1:size(H,1);
for k = 1:numel(csv_files)
    fname = csv_files(k).name;
    fname_g = sprintf('%s_FWHM=%.3fm_sigma=%.3fm', fname(1:end-4), FWHM, sigma); 
    
    H = csvread(fname);
    
    subplot(sp_r, sp_c, (k-1)*sp_c + 1);
    imagesc(t_ps-t_ps(1), x, H);
    title(fname);
    xlabel('$t$ (ps)')
    
    Nt = size(H,2);
    Nx = size(H,1);


    H_g = abs(ifft(fft(H,[],2).*fft(fftshift(f_g),[],2), [], 2));
    csvwrite(['./output/' fname_g, '.csv'], H_g);
        
    subplot(sp_r, sp_c, (k-1)*sp_c + 2);
    imagesc(t_ps-t_ps(1), x, H_g)
    g_title = sprintf('$\\textrm{FWHM} = %.1f \\textrm{ cm}$ \n $\\sigma = %.1f \\textrm{ cm}$', FWHM*100, sigma*100);
    title(sprintf('%s \n No Poisson noise', g_title));
    xlabel('$t$ (ps)')
    H_g_norm = H_g./sum(H_g(:));
    for j=1:numel(NPHOTONS)
        p = NPHOTONS(j);
        H_g_p = poissrnd(H_g_norm*p); 
        H_g_p(isnan(H_g_p)) = 0;
        subplot(sp_r, sp_c, (k-1)*sp_c + 2 + j);
        imagesc(t_ps-t_ps(1), x, H_g_p);
        title(sprintf('%s\n%.0fk photons', g_title, p/1e3));
        xlabel('$t$ (ps)')
        fname_g_p = sprintf('%s_photons=%dk', fname_g, fix(p/1e3));
        csvwrite(['./output/' fname_g_p '.csv'], H_g_p);
    end
    drawnow
end
export_fig('output_figure.pdf')
% subplot(sp_r, sp_c, sp_r*sp_c - numel(NPHOTONS))
% t_range = (fix(numel(t_m)/2)-50) : (fix(numel(t_m)/2)+50);
% 
% t_ps = t_m*m2ps;
% plot(t_m(t_range), f_g(t_range));
% axis tight
% hold on
% hasym(0.5)
% xlabel('$t$ (ps)')