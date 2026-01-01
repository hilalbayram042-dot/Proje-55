document.addEventListener('DOMContentLoaded', () => {
    // --- Element Seçimleri ---
    const loginFormSection = document.getElementById('loginFormSection');
    const registerFormSection = document.getElementById('registerFormSection');
    const loggedInSection = document.getElementById('loggedInSection');
    const myTicketsSection = document.getElementById('myTicketsSection');
    const adminSection = document.getElementById('adminSection');
    const ticketListDiv = document.getElementById('ticketList');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const logoutButton = document.getElementById('logoutButton');
    const showRegisterFormLink = document.getElementById('showRegisterFormLink');
    const showLoginFormLink = document.getElementById('showLoginForm');
    const welcomeMessage = document.getElementById('welcomeMessage');

    // --- Fonksiyonlar ---
    function getStoredUsers() {
        let users = JSON.parse(localStorage.getItem('simulatedUsers')) || [];
        if (!users.some(u => u.email === 'test@example.com')) {
            users.push({
                firstName: 'Test',
                lastName: 'Kullanıcısı',
                email: 'test@example.com',
                password: 'password123',
                tc: '12345678901',
                phone: '5551234567',
                role: 'user'
            });
            saveUsers(users);
        }
        return users;
    }

    function saveUsers(users) {
        localStorage.setItem('simulatedUsers', JSON.stringify(users));
    }

    /**
     * Biletleri listelerken koltuk numarasını ve iptal butonunu ekler.
     */
    function renderPurchasedTickets() {
        const loggedInUserEmail = sessionStorage.getItem('loggedInUserEmail');
        if (!loggedInUserEmail) {
            ticketListDiv.innerHTML = '<p>Biletlerinizi görmek için lütfen giriş yapın.</p>';
            return;
        }

        const allTickets = JSON.parse(localStorage.getItem('purchasedTickets')) || [];
        const userTickets = allTickets.filter(ticket => ticket.ownerEmail === loggedInUserEmail);

        ticketListDiv.innerHTML = '';

        if (userTickets.length > 0) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            userTickets.forEach(ticket => {
                const ticketElement = document.createElement('div');
                ticketElement.classList.add('ticket-item');

                const ticketDate = new Date(ticket.departureDate);
                const isExpired = ticketDate < today;

                let actionButtonHtml = '';
                if (ticket.status === 'canceled') {
                    actionButtonHtml = `<p style="color: red;">Bu bilet iptal edilmiştir.</p>`;
                    ticketElement.style.opacity = '0.5';
                } else if (isExpired) {
                    actionButtonHtml = `<p class="expired-ticket-info">Bu biletin tarihi geçmiştir.</p>`;
                } else {
                    actionButtonHtml = `<button class="cancel-ticket-btn" data-pnr="${ticket.pnr}">Bileti İptal Et</button>`;
                }


                const passengersHtml = ticket.passengers.map(p => `<p><strong>Yolcu:</strong> ${p.name} ${p.surname}</p>`).join('');

                ticketElement.innerHTML = `
                    <h3>PNR: ${ticket.pnr}</h3>
                    <p><strong>Güzergah:</strong> ${ticket.departureCity} -> ${ticket.arrivalCity}</p>
                    <p><strong>Gidiş Tarihi:</strong> ${ticket.departureDate}</p>
                    <p><strong>Kalkış / Varış Saatleri:</strong> ${ticket.departureTime} / ${ticket.arrivalTime}</p>
                    <p><strong>Koltuklar:</strong> ${ticket.selectedSeats.join(', ')}</p>
                    ${passengersHtml}
                    <div class="ticket-action">${actionButtonHtml}</div>
                `;
                ticketListDiv.appendChild(ticketElement);
            });
        } else {
            ticketListDiv.innerHTML = '<p>Henüz satın alınmış biletiniz bulunmamaktadır.</p>';
        }
    }

    /**
     * Admin paneli için tüm satılan biletleri listeler.
     */
    function renderAdminPanel() {
        const allTicketsListDiv = document.getElementById('all-tickets-list');
        const adminStatsDiv = document.getElementById('admin-stats');
        const allTickets = JSON.parse(localStorage.getItem('purchasedTickets')) || [];

        allTicketsListDiv.innerHTML = ''; // Önceki listeyi temizle

        if (allTickets.length > 0) {
            const activeTickets = allTickets.filter(ticket => ticket.status !== 'canceled');
            const totalRevenue = activeTickets.reduce((sum, ticket) => sum + ticket.finalPrice, 0);
            const totalSold = allTickets.length;
            const totalCanceled = allTickets.length - activeTickets.length;

            adminStatsDiv.innerHTML = `<h4>Toplam Kazanç: ${totalRevenue.toFixed(2)} TL</h4><p>Toplam Satılan Bilet: ${totalSold}</p><p>İptal Edilen Bilet: ${totalCanceled}</p>`;

            allTickets.forEach(ticket => {
                const ticketCard = document.createElement('div');
                ticketCard.classList.add('admin-ticket-card'); // Admin için stil sınıfı
                if (ticket.status === 'canceled') {
                    ticketCard.style.opacity = '0.5'; // Visually indicate cancellation
                }
                
                const passengersHtml = ticket.passengers.map(p => `<li>${p.name} ${p.surname}</li>`).join('');

                let statusHtml = '';
                if (ticket.status === 'canceled') {
                    statusHtml = `<p style="color: red; font-weight: bold;">BİLET İPTAL EDİLDİ</p>`;
                }
                

                // Dikey hizalama için basitleştirilmiş HTML yapısı
                ticketCard.innerHTML = `
                    ${statusHtml}
                    <p class="admin-pnr" style="font-size: 1.2em; color: #00bfff;"><strong>PNR:</strong> ${ticket.pnr}</p>
                    <p><strong>Güzergah:</strong> ${ticket.departureCity} -> ${ticket.arrivalCity}</p>
                    <p><strong>Gidiş Tarihi:</strong> ${ticket.departureDate}</p>
                    <p><strong>Kalkış / Varış Saatleri:</strong> ${ticket.departureTime} - ${ticket.arrivalTime}</p>
                    <p><strong>Koltuklar:</strong> ${ticket.selectedSeats.join(', ')}</p>
                    <p><strong>Tutar:</strong> ${ticket.finalPrice.toFixed(2)} TL</p>
                    <p><strong>Yolcular:</strong></p>
                    <ul>${passengersHtml}</ul>
                    
                `;
                allTicketsListDiv.appendChild(ticketCard);
            });
        } else {
            adminStatsDiv.innerHTML = '';
            allTicketsListDiv.innerHTML = '<p>Sistemde hiç satılmış bilet bulunmamaktadır.</p>';
        }
    }

    function renderPage() {
        const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
        const userEmail = sessionStorage.getItem('loggedInUserEmail');
        const userRole = sessionStorage.getItem('userRole');

        if (isLoggedIn) {
            loginFormSection.style.display = 'none';
            registerFormSection.style.display = 'none';
            loggedInSection.style.display = 'block';
            logoutButton.style.display = 'block';
            welcomeMessage.textContent = `Hoş Geldiniz, ${userEmail}!`;

            if (userRole === 'admin') {
                myTicketsSection.style.display = 'none';
                adminSection.style.display = 'block';
                renderAdminPanel(); // Admin ise admin panelini göster
            } else {
                myTicketsSection.style.display = 'block';
                adminSection.style.display = 'none';
                renderPurchasedTickets(); // Normal kullanıcı ise kendi biletlerini göster
            }
        } else {
            // ... (giriş yapılmamış durum)
            loginFormSection.style.display = 'block';
            registerFormSection.style.display = 'none';
            loggedInSection.style.display = 'none';
            myTicketsSection.style.display = 'none';
            adminSection.style.display = 'none';
            logoutButton.style.display = 'none';
        }
    }
    
    function handleLogin(event) {
        event.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value.trim();
        const users = getStoredUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('loggedInUserEmail', user.email);
            sessionStorage.setItem('userRole', user.role || 'user');
            alert('Giriş başarılı!');
            renderPage();
        } else {
            alert('Geçersiz e-posta veya şifre.');
        }
    }

    function handleRegister(event) {
        event.preventDefault();
        const email = document.getElementById('regEmail').value.trim();
        const users = getStoredUsers();

        if (users.some(u => u.email === email)) {
            alert('Bu e-posta adresi zaten kullanımda.');
            return;
        }

        const newUser = { /* ... (yeni kullanıcı bilgileri) ... */ };
        users.push(newUser);
        saveUsers(users);
        alert('Üyelik başarıyla oluşturuldu!');
        showLoginFormLink.click();
    }

    function handleLogout() {
        sessionStorage.clear();
        alert('Çıkış yapıldı.');
        renderPage();
    }
    
    /**
     * PNR numarasına göre bileti iptal eder.
     * @param {string} pnr - İptal edilecek biletin PNR numarası.
     */
    function handleCancelTicket(pnr) {
        if (confirm(`PNR numaralı: ${pnr} bileti iptal etmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
            let allTickets = JSON.parse(localStorage.getItem('purchasedTickets')) || [];
            const ticketIndex = allTickets.findIndex(ticket => ticket.pnr === pnr);

            if (ticketIndex > -1) {
                allTickets[ticketIndex].status = 'canceled'; // Add a status
                localStorage.setItem('purchasedTickets', JSON.stringify(allTickets));
                alert('Bilet başarıyla iptal edildi.');
                renderPage(); // Re-render the whole page to update admin or user view
            } else {
                alert('İptal edilecek bilet bulunamadı.');
            }
        }
    }

    // --- Olay Dinleyicileri ---
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
    if (logoutButton) logoutButton.addEventListener('click', handleLogout);


    if (showRegisterFormLink) { /* ... */ }
    if (showLoginFormLink) { /* ... */ }

    // Bilet iptali için olay dinleyicisi (Event Delegation)
    ticketListDiv.addEventListener('click', (event) => {
        if (event.target.classList.contains('cancel-ticket-btn')) {
            const pnr = event.target.dataset.pnr;
            handleCancelTicket(pnr);
        }
    });

    /**
     * Depolama (storage) değişikliklerini dinleyerek sekmeler arası senkronizasyon sağlar.
     * Başka bir sekmede bilet alınınca bu sekmedeki listeyi günceller.
     */
    window.addEventListener('storage', (event) => {
        if (event.key === 'purchasedTickets') {
            // Bilet verisi değiştiğinde, sayfanın ilgili bölümünü yeniden çiz.
            renderPage();
        }
    });

    // Sayfa ilk yüklendiğinde durumu render et
    renderPage();
});