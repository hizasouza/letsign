document.addEventListener('DOMContentLoaded', () => {
    const signDocumentBtn = document.getElementById('sign-document-btn');
    
    // Modal instances
    const securityScanModalEl = document.getElementById('securityScanModal');
    const securityScanModal = new bootstrap.Modal(securityScanModalEl);
    
    const biometricModalEl = document.getElementById('biometricModal');
    const biometricModal = new bootstrap.Modal(biometricModalEl);
    
    const resultModalEl = document.getElementById('resultModal');
    const resultModal = new bootstrap.Modal(resultModalEl);

    // Security Scan elements
    const malwareCheckStatus = document.getElementById('malware-check-status');
    const connectionCheckStatus = document.getElementById('connection-check-status');
    const rootCheckStatus = document.getElementById('root-check-status');
    const securityScanProgress = document.getElementById('security-scan-progress');
    const scanResultMessage = document.getElementById('scan-result-message');

    // Biometric elements
    const biometricIcon = document.getElementById('biometric-icon');
    const biometricStatus = document.getElementById('biometric-status');
    const biometricLoader = document.getElementById('biometric-loader');
    const cancelBiometricBtn = document.getElementById('cancel-biometric-btn');

    // Result Modal elements
    const resultModalLabel = document.getElementById('resultModalLabel');
    const resultModalMessage = document.getElementById('resultModalMessage');
    const tokenInfoDiv = document.getElementById('token-info');
    const authTokenValueSpan = document.getElementById('auth-token-value');

    // Document status
    const signatureStatusDiv = document.getElementById('signature-status');
    const geolocationInfoDiv = document.getElementById('geolocation-info');

    let biometricAuthCancelled = false;

    // --- SIMULATION FUNCTIONS ---

    function simulateSecurityScan() {
        return new Promise((resolve) => {
            securityScanModal.show();
            scanResultMessage.textContent = "";
            securityScanProgress.style.width = '0%';
            securityScanProgress.classList.remove('bg-success', 'bg-danger');
            securityScanProgress.classList.add('bg-fiap-orange');


            const checks = [
                { el: malwareCheckStatus, delay: 1000, text: "Verificando malwares...", success: Math.random() > 0.1 }, // 90% success
                { el: connectionCheckStatus, delay: 1500, text: "Verificando conexões...", success: Math.random() > 0.05 }, // 95% success
                { el: rootCheckStatus, delay: 2000, text: "Verificando root/jailbreak...", success: Math.random() > 0.15 } // 85% success
            ];
            let currentProgress = 0;
            const progressIncrement = 100 / checks.length;
            let overallSuccess = true;

            checks.forEach(check => check.el.innerHTML = '<i class="fas fa-spinner fa-spin"></i>');

            async function runChecks() {
                for (let i = 0; i < checks.length; i++) {
                    const check = checks[i];
                    check.el.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; // Reset icon
                    await new Promise(r => setTimeout(r, check.delay));
                    
                    currentProgress += progressIncrement;
                    securityScanProgress.style.width = `${currentProgress}%`;

                    if (check.success) {
                        check.el.innerHTML = '<i class="fas fa-check-circle text-success"></i>';
                    } else {
                        check.el.innerHTML = '<i class="fas fa-times-circle text-danger"></i>';
                        overallSuccess = false;
                    }
                }

                if (overallSuccess) {
                    scanResultMessage.textContent = "Dispositivo seguro!";
                    scanResultMessage.className = 'mt-3 text-center fw-bold text-success';
                    securityScanProgress.classList.remove('bg-fiap-orange');
                    securityScanProgress.classList.add('bg-success');
                    setTimeout(() => {
                        securityScanModal.hide();
                        resolve(true);
                    }, 1500);
                } else {
                    scanResultMessage.textContent = "Ameaça detectada! Assinatura não permitida.";
                    scanResultMessage.className = 'mt-3 text-center fw-bold text-danger';
                    securityScanProgress.classList.remove('bg-fiap-orange');
                    securityScanProgress.classList.add('bg-danger');
                    setTimeout(() => {
                        securityScanModal.hide();
                        resolve(false);
                    }, 2500);
                }
            }
            runChecks();
        });
    }

    function simulateBiometricAuth() {
        return new Promise((resolve) => {
            biometricModal.show();
            biometricAuthCancelled = false;
            biometricIcon.className = 'fas fa-fingerprint fa-5x text-secondary my-3'; // Reset icon
            biometricStatus.textContent = "Aguardando autenticação...";
            biometricStatus.className = 'fw-bold';
            biometricLoader.classList.add('d-none');
            
            // Simulate API call and user interaction (e.g., Touch ID / Face ID)
            setTimeout(() => {
                if (biometricAuthCancelled) return; // If cancelled, do nothing further here

                biometricStatus.textContent = "Verificando...";
                biometricLoader.classList.remove('d-none');
                biometricIcon.classList.add('d-none'); // Hide icon during "loading"

                setTimeout(() => {
                    if (biometricAuthCancelled) return;

                    biometricLoader.classList.add('d-none');
                    biometricIcon.classList.remove('d-none'); 
                    
                    const success = Math.random() > 0.2; // 80% chance of success

                    if (success) {
                        biometricIcon.className = 'fas fa-check-circle fa-5x text-success my-3';
                        biometricStatus.textContent = "Autenticação bem-sucedida!";
                        biometricStatus.className = 'fw-bold text-success';
                        setTimeout(() => {
                            biometricModal.hide();
                            resolve(true);
                        }, 1500);
                    } else {
                        biometricIcon.className = 'fas fa-times-circle fa-5x text-danger my-3';
                        biometricStatus.textContent = "Falha na autenticação. Tente novamente.";
                        biometricStatus.className = 'fw-bold text-danger';
                        // In a real app, you might allow retries or just fail.
                        // For demo, we close after a bit.
                        setTimeout(() => {
                            biometricModal.hide();
                            resolve(false);
                        }, 2500);
                    }
                }, 2000); // Simulating verification time
            }, 1000); // Simulating time for user to place finger/face
        });
    }

    function simulateGeolocationCapture() {
        return new Promise((resolve) => {
            // In a real app: navigator.geolocation.getCurrentPosition(...)
            // For simulation:
            geolocationInfoDiv.innerHTML = `<i class="fas fa-map-marker-alt"></i> Geolocalização capturada: Latitude ${ (Math.random() * 180 - 90).toFixed(4) }, Longitude ${ (Math.random() * 360 - 180).toFixed(4) }`;
            geolocationInfoDiv.classList.remove('d-none');
            setTimeout(() => resolve(true), 500); // Short delay for visual effect
        });
    }

    function showResult(success, message, token = null) {
        resultModalLabel.textContent = success ? "Sucesso!" : "Falha na Assinatura";
        resultModalLabel.className = success ? "modal-title text-success" : "modal-title text-danger";
        resultModalMessage.textContent = message;

        if (success && token) {
            authTokenValueSpan.textContent = token;
            tokenInfoDiv.classList.remove('d-none');
        } else {
            tokenInfoDiv.classList.add('d-none');
        }
        resultModal.show();
    }

    // --- EVENT LISTENERS ---
    signDocumentBtn.addEventListener('click', async () => {
        signDocumentBtn.disabled = true;
        signDocumentBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processando...';
        
        // Reset previous states
        signatureStatusDiv.textContent = "Aguardando Assinatura...";
        signatureStatusDiv.className = 'signature-box p-3';
        geolocationInfoDiv.classList.add('d-none');


        // 0. (Optional but good) Capture Geolocation
        await simulateGeolocationCapture();

        // 1. Security Scan
        const securityScanOk = await simulateSecurityScan();
        if (!securityScanOk) {
            showResult(false, "A verificação de segurança do dispositivo falhou. A assinatura não pode prosseguir.");
            signDocumentBtn.disabled = false;
            signDocumentBtn.innerHTML = '<i class="fas fa-file-signature"></i> Iniciar Processo de Assinatura';
            return;
        }

        // 2. Biometric Authentication
        const biometricAuthOk = await simulateBiometricAuth();
        if (biometricAuthCancelled) { // Check if it was cancelled by user
             showResult(false, "Autenticação biométrica cancelada pelo usuário.");
        } else if (!biometricAuthOk) {
            showResult(false, "A autenticação biométrica falhou. A assinatura não pode prosseguir.");
        } else {
            // All checks passed!
            const authToken = `LS_TOKEN_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
            showResult(true, "Documento assinado com sucesso utilizando autenticação biométrica e verificação de dispositivo!", authToken);
            
            signatureStatusDiv.textContent = `Assinado digitalmente por Usuário (Autenticação Biométrica Verificada) em ${new Date().toLocaleString()}`;
            signatureStatusDiv.classList.add('signed');
        }

        signDocumentBtn.disabled = false;
        signDocumentBtn.innerHTML = '<i class="fas fa-file-signature"></i> Iniciar Processo de Assinatura';
    });

    cancelBiometricBtn.addEventListener('click', () => {
        biometricAuthCancelled = true; 
    });
    
    [securityScanModalEl, biometricModalEl].forEach(modalEl => {
        modalEl.addEventListener('hidden.bs.modal', () => {

            securityScanProgress.style.width = '0%';
            scanResultMessage.textContent = "";
            const checks = [malwareCheckStatus, connectionCheckStatus, rootCheckStatus];
            checks.forEach(check => check.innerHTML = '<i class="fas fa-spinner fa-spin"></i>');
            biometricIcon.className = 'fas fa-fingerprint fa-5x text-secondary my-3';
            biometricStatus.textContent = "Aguardando autenticação...";
            biometricLoader.classList.add('d-none');
        });
    });

});