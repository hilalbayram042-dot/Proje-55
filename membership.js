// membership.js
document.addEventListener('DOMContentLoaded', () => {

    // --- Simulated Ticket Data for Demo ---
    // This function creates some sample tickets if none exist, for demonstration.
    function createInitialTickets() {
        const tickets = JSON.parse(localStorage.getItem('purchasedTickets'));
        // Check if tickets is null or an empty array
        if (!tickets || tickets.length === 0) {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const dayAfterTomorrow = new Date(today);
            dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

            const sampleTickets = [
                {
                    pnr: 'SKY-12345',
                    flightNumber: 'TK2024',
                    airline: 'Turkish Airlines',
                    departureCity: 'Istanbul',
                    arrivalCity: 'Ankara',
                    departureTime: '08:00',
                    arrivalTime: '09:30',
                    departureDate: tomorrow.toISOString().split('T')[0],
                    seatClass: 'Ekonomi',
                    selectedSeats: ['15A'],
                    finalPrice: 850.00,
                    purchaserEmail: 'meltemkoran049@gmail.com',
                    associatedUserEmail: 'meltemkoran049@gmail.com',
                    passengers: [
                        { name: 'Meltem', surname: 'Koran', tc: '11111111111', isChild: false }
                    ]
                },
                {
                    pnr: 'PEG-67890',
                    flightNumber: 'PC2025',
                    airline: 'Pegasus',
                    departureCity: 'Izmir',
                    arrivalCity: 'Antalya',
                    departureTime: '14:00',
                    arrivalTime: '15:15',
                    departureDate: dayAfterTomorrow.toISOString().split('T')[0],
                    seatClass: 'Business',
                    selectedSeats: ['2B'],
                    finalPrice: 1800.00,
                    purchaserEmail: 'meltemkoran049@gmail.com',
                    associatedUserEmail: 'meltemkoran049@gmail.com',
                    passengers: [
                        { name: 'Meltem', surname: 'Koran', tc: '11111111111', isChild: false }
                    ]
                }
            ];
            localStorage.setItem('purchasedTickets', JSON.stringify(sampleTickets));
        }
    }
    // Call the function to create initial tickets if needed.
    createInitialTickets();

    const loginFormSection = document.getElementById('loginFormSection');
    const registerFormSection = document.getElementById('registerFormSection');
    const loggedInSection = document.getElementById('loggedInSection');
    const myTicketsSection = document.getElementById('myTicketsSection');
    const ticketListDiv = document.getElementById('ticketList');

    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const logoutButton = document.getElementById('logoutButton');
    const showRegisterFormLink = document.getElementById('showRegisterFormLink');
    const showLoginFormLink = document.getElementById('showLoginForm');

    const loginEmailInput = document.getElementById('loginEmail');
    const loginPasswordInput = document.getElementById('loginPassword');

    const regFirstNameInput = document.getElementById('regFirstName');
    const regLastNameInput = document.getElementById('regLastName');
    const regTcInput = document.getElementById('regTc');
    const regPhoneInput = document.getElementById('regPhone');
    const regEmailInput = document.getElementById('regEmail');
    const regPasswordInput = document.getElementById('regPassword');

    const welcomeMessage = document.getElementById('welcomeMessage');

    // --- Simulated User Data Storage ---
    // In a real application, this would be handled by a backend
    function getStoredUsers() {
        let users = JSON.parse(localStorage.getItem('simulatedUsers')) || [];
        let needsSave = false;

        // Ensure admin user exists and has the correct details
        let admin = users.find(u => u.role === 'admin');
        if (!admin) {
            // If no admin, create one
            admin = { email: 'admin123@gmail.com', role: 'admin' };
            users.push(admin);
        }
        // Update admin details
        admin.firstName = 'Admin';
        admin.lastName = 'User';
        admin.password = '123456';
        admin.tc = '00000000000';
        admin.phone = '0000000000';
        
        // Ensure default user exists
        if (!users.some(u => u.email === 'meltemkoran049@gmail.com')) {
            users.push({
                firstName: 'Meltem',
                lastName: 'Koran',
                email: 'meltemkoran049@gmail.com',
                password: '123456',
                tc: '11111111111',
                phone: '1111111111',
                role: 'user'
            });
            needsSave = true;
        }

        // Add a new test user as requested, avoiding email collision
        if (!users.some(u => u.email === 'meltemkoran049_test@gmail.com')) {
            users.push({
                firstName: 'Test',
                lastName: 'User',
                email: 'meltemkoran049_test@gmail.com',
                password: '123456',
                tc: '12345678901',
                phone: '1234567890',
                role: 'user'
            });
            needsSave = true;
        }
        
        // Remove old admin if email changed
        const oldAdminIndex = users.findIndex(u => u.email === 'meltemkoran49@gmail.com');
        if (oldAdminIndex > -1) {
            users.splice(oldAdminIndex, 1);
            needsSave = true;
        }

        if(needsSave){
             saveUsers(users);
        }
       
        return users;
    }

    function saveUsers(users) {
        localStorage.setItem('simulatedUsers', JSON.stringify(users));
    }

    // --- Functions ---

        function renderPurchasedTickets() {
        const allTickets = JSON.parse(localStorage.getItem('purchasedTickets')) || [];
        const loggedInUserEmail = sessionStorage.getItem('loggedInUserEmail');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!loggedInUserEmail) {
            ticketListDiv.innerHTML = '<p data-translate="login_to_see_tickets">Biletlerinizi görmek için lütfen giriş yapın.</p>';
            return;
        }

        // Filter tickets for the logged-in user
        const userTickets = allTickets.filter(ticket => {
            return ticket.purchaserEmail === loggedInUserEmail || (ticket.associatedUserEmail && ticket.associatedUserEmail === loggedInUserEmail);
        });

        if (userTickets.length > 0) {
            ticketListDiv.innerHTML = ''; // Clear "No tickets found" message

            userTickets.forEach((bookingDetails) => {
                const ticketDate = new Date(bookingDetails.departureDate);
                const isExpired = ticketDate < today;

                const ticketItem = document.createElement('div');
                ticketItem.classList.add('ticket-item');
                if (isExpired) {
                    ticketItem.classList.add('expired-ticket');
                }

                let actionHtml = '';
                if (!isExpired) {
                    actionHtml = `<button class="cancel-ticket-btn" data-pnr="${bookingDetails.pnr}">Bileti İptal Et</button>`;
                } else {
                    actionHtml = `<p class="expired-ticket-message">Bu biletin tarihi geçmiştir.</p>`;
                }
                
                let specialNote = '';
                if (bookingDetails.isChildTicket) {
                    const childPassenger = bookingDetails.passengers.find(p => p.isChild);
                    if (childPassenger) {
                        specialNote = `<p style="color: #00bfff; font-weight: bold;">Not: Bu bilet, velisi olduğunuz "${childPassenger.name} ${childPassenger.surname}" adlı çocuk için düzenlenmiştir.</p>`;
                    }
                }

                const from = bookingDetails.departureCity || 'Bilinmiyor';
                const to = bookingDetails.arrivalCity || 'Bilinmiyor';


                ticketItem.innerHTML = `
                    ${specialNote}
                    <h3>Uçuş Numarası: ${bookingDetails.flightNumber} (PNR: ${bookingDetails.pnr})</h3>
                    <p>Havayolu: ${bookingDetails.airline}</p>
                    <p><b>Güzergah: ${from} -> ${to}</b></p>
                    <p>Kalkış: ${bookingDetails.departureTime} - Varış: ${bookingDetails.arrivalTime}</p>
                    <p>Kalkış Tarihi: ${bookingDetails.departureDate}</p>
                    <p>Sınıf: ${bookingDetails.seatClass}</p>
                    <p>Koltuklar: ${bookingDetails.selectedSeats.join(', ')}</p>
                    <p>Toplam Tutar: ${bookingDetails.finalPrice.toFixed(2)} TL</p>
                    <h4>Yolcu Bilgileri:</h4>
                    ${bookingDetails.passengers.map(p => {
                        let passengerLabel = p.isChild ? '(Çocuk)' : '(Yetişkin)';
                        return `<p>${p.name} ${p.surname} ${passengerLabel} (TC: ${p.tc || 'N/A'})</p>`;
                    }).join('')}
                    ${actionHtml}
                `;
                ticketListDiv.appendChild(ticketItem);
            });
        } else {
            ticketListDiv.innerHTML = '<p data-translate="no_purchased_tickets">Henüz satın alınmış biletiniz bulunmamaktadır.</p>';
        }
    }

    function handleCancelTicket(pnr, isAdmin = false) {
        if (confirm('Bu bileti iptal etmek istediğinizden emin misiniz?')) {
            let purchasedTickets = JSON.parse(localStorage.getItem('purchasedTickets')) || [];
            const ticketToCancel = purchasedTickets.find(ticket => String(ticket.pnr) === String(pnr));

            if (!ticketToCancel) {
                alert('İptal edilecek bilet bulunamadı.');
                return;
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const ticketDate = new Date(ticketToCancel.departureDate);
            ticketDate.setHours(0, 0, 0, 0); // Normalize to compare just dates

            if (ticketDate < today) {
                alert('Bu biletin tarihi geçmiş olduğu için iptal edilemez.');
                return;
            }

            purchasedTickets = purchasedTickets.filter(ticket => String(ticket.pnr) !== String(pnr));
            localStorage.setItem('purchasedTickets', JSON.stringify(purchasedTickets));
            
            alert('Bilet başarıyla iptal edildi.');

            // Re-render both user and admin views
            renderPurchasedTickets();
            if (isAdmin) {
                renderAdminPanel();
            }
        }
    }

    function renderAdminPanel() {
        const adminStatsDiv = document.getElementById('admin-stats');
        const allTicketsListDiv = document.getElementById('all-tickets-list');
        
        const allTickets = JSON.parse(localStorage.getItem('purchasedTickets')) || [];

        // Calculate total revenue
        const totalRevenue = allTickets.reduce((sum, ticket) => sum + (ticket.finalPrice || 0), 0);
        adminStatsDiv.innerHTML = `<h4>Toplam Kazanç: ${totalRevenue.toFixed(2)} TL</h4>`;

        // List all tickets
        if (allTickets.length > 0) {
            allTicketsListDiv.innerHTML = ''; // Clear previous content
            allTickets.forEach(ticket => {
                const ticketCard = document.createElement('div');
                ticketCard.classList.add('admin-ticket-card');

                const passengersHtml = ticket.passengers.map(p => `
                    <li>${p.name} ${p.surname} (TC: ${p.tc || 'N/A'})</li>
                `).join('');

                ticketCard.innerHTML = `
                    <div class="card-header">
                        <strong>PNR: ${ticket.pnr}</strong>
                        <span>Tutar: ${ticket.finalPrice.toFixed(2)} TL</span>
                    </div>
                    <div class="card-body">
                        <div class="card-section">
                            <strong>Uçuş Bilgileri</strong>
                            <p>${ticket.departureCity || 'N/A'} -> ${ticket.arrivalCity || 'N/A'}</p>
                            <p>Tarih: ${ticket.departureDate} | Saat: ${ticket.departureTime}</p>
                            <p>Koltuklar: ${ticket.selectedSeats.join(', ')}</p>
                        </div>
                        <div class="card-section">
                            <strong>Yolcu Bilgileri</strong>
                            <ul>${passengersHtml}</ul>
                        </div>
                        <div class="card-section">
                            <strong>İletişim</strong>
                            <p>${ticket.purchaserEmail || 'N/A'}</p>
                        </div>
                    </div>
                `;
                allTicketsListDiv.appendChild(ticketCard);
            });
        } else {
            allTicketsListDiv.innerHTML = '<p>Sistemde hiç satılmış bilet bulunmamaktadır.</p>';
        }
    }

    function renderPage() {
        const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
        const loggedInUserEmail = sessionStorage.getItem('loggedInUserEmail');
        const userRole = sessionStorage.getItem('userRole');

        const adminSection = document.getElementById('adminSection');

        if (isLoggedIn) {
            loginFormSection.style.display = 'none';
            registerFormSection.style.display = 'none';
            loggedInSection.style.display = 'block';
            logoutButton.style.display = 'block';
            welcomeMessage.textContent = `Hoş Geldiniz, ${loggedInUserEmail || 'Üye'}!`;
            
            if (userRole === 'admin') {
                myTicketsSection.style.display = 'none'; // Hide for admin
                adminSection.style.display = 'block';
                renderAdminPanel();
            } else {
                myTicketsSection.style.display = 'block'; // Show for regular users
                adminSection.style.display = 'none';
                renderPurchasedTickets();
            }

        } else {
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
        const email = loginEmailInput.value.trim();
        const password = loginPasswordInput.value.trim();
        const users = getStoredUsers();

        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('loggedInUserEmail', user.email);
            sessionStorage.setItem('userRole', user.role || 'user'); // Store user role
            alert('Giriş başarılı!');
            renderPage();
        } else {
            alert('Geçersiz e-posta veya şifre.');
        }
    }

    function handleRegister(event) {
        event.preventDefault();
        const firstName = regFirstNameInput.value;
        const lastName = regLastNameInput.value;
        const email = regEmailInput.value;
        const password = regPasswordInput.value;
        const tc = regTcInput.value;
        const phone = regPhoneInput.value;

        const users = getStoredUsers();

        if (users.some(u => u.email === email)) {
            alert('Bu e-posta adresi zaten kullanımda.');
            return;
        }

        users.push({ firstName, lastName, email, password, tc, phone, role: 'user' }); // Default role
        saveUsers(users);
        alert('Üyelik başarıyla oluşturuldu! Şimdi giriş yapabilirsiniz.');
        // After registration, switch to login form
        loginFormSection.style.display = 'block';
        registerFormSection.style.display = 'none';
        loginForm.reset(); // Clear login form fields
        registerForm.reset(); // Clear register form fields
    }

    function handleLogout() {
        sessionStorage.removeItem('isLoggedIn');
        sessionStorage.removeItem('loggedInUserEmail');
        sessionStorage.removeItem('userRole'); // Clear user role
        alert('Çıkış yapıldı.');
        renderPage();
        loginForm.reset(); // Clear login form fields on logout
    }

    // --- Event Listeners ---
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
    if (logoutButton) logoutButton.addEventListener('click', handleLogout);

    if (showRegisterFormLink) {
        showRegisterFormLink.addEventListener('click', (event) => {
            event.preventDefault();
            loginFormSection.style.display = 'none';
            registerFormSection.style.display = 'block';
            registerForm.reset(); // Clear register form fields
        });
    }

    if (showLoginFormLink) {
        showLoginFormLink.addEventListener('click', (event) => {
            event.preventDefault();
            loginFormSection.style.display = 'block';
            registerFormSection.style.display = 'none';
            loginForm.reset(); // Clear login form fields
        });
    }

    if (ticketListDiv) {
        ticketListDiv.addEventListener('click', (event) => {
            if (event.target.classList.contains('cancel-ticket-btn')) {
                const pnr = event.target.dataset.pnr;
                handleCancelTicket(pnr, false);
            }
        });
    }

    const adminSection = document.getElementById('adminSection');
    if (adminSection) {
        adminSection.addEventListener('click', (event) => {
            if (event.target.classList.contains('admin-cancel-btn')) {
                const pnr = event.target.dataset.pnr;
                handleCancelTicket(pnr, true);
            }
        });
    }

    // Initial render when page loads
    renderPage();
});