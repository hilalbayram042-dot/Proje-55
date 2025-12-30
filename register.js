// register.js
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const regFirstNameInput = document.getElementById('regFirstName');
    const regLastNameInput = document.getElementById('regLastName');
    const regTcInput = document.getElementById('regTc');
    const regPhoneInput = document.getElementById('regPhone');
    const regEmailInput = document.getElementById('regEmail');
    const regPasswordInput = document.getElementById('regPassword');

    function getStoredUsers() {
        let users = JSON.parse(localStorage.getItem('simulatedUsers')) || [];
        let needsSave = false;

        // Yönetici kullanıcısının var olduğundan ve doğru ayrıntılara sahip olduğundan emin olun
        let admin = users.find(u => u.role === 'admin');
        if (!admin) {
            // Yönetici yoksa bir tane oluşturun
            admin = { email: 'admin123@gmail.com', role: 'admin' };
            users.push(admin);
        }
        // Yönetici ayrıntılarını güncelleyin
        admin.firstName = 'Admin';
        admin.lastName = 'User';
        admin.password = '123456';
        admin.tc = '00000000000';
        admin.phone = '0000000000';
        
        // Varsayılan kullanıcının var olduğundan emin olun
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
        
        // E-posta değiştiyse eski yöneticiyi kaldırın
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

    function handleRegister(event) {
        event.preventDefault();
        const firstName = regFirstNameInput.value;
        const lastName = regLastNameInput.value;
        const tc = regTcInput.value;
        const phone = regPhoneInput.value;
        const email = regEmailInput.value;
        const password = regPasswordInput.value;

        const users = getStoredUsers();

        if (users.some(u => u.email === email)) {
            alert('Bu e-posta adresi zaten kullanımda.');
            return;
        }

        users.push({ firstName, lastName, email, password, tc, phone });
        saveUsers(users);
        alert('Üyelik başarıyla oluşturuldu! Şimdi giriş yapabilirsiniz.');
        window.location.href = 'membership.html'; // Redirect to login page
    }

    if (registerForm) registerForm.addEventListener('submit', handleRegister);
    getStoredUsers();
});
