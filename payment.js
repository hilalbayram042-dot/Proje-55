document.addEventListener('DOMContentLoaded', () => {
    const paymentSummary = document.getElementById('payment-summary');
    const payBtn = document.getElementById('pay-btn');
    const cardNumberInput = document.getElementById('card-number');
    const cardNameInput = document.getElementById('card-name');
    const expiryDateInput = document.getElementById('expiry-date');
    const cvcInput = document.getElementById('cvc');

    const bookingDetails = JSON.parse(sessionStorage.getItem('bookingDetails'));

    if (!bookingDetails) {
        window.location.href = 'index.html';
        return;
    }

    paymentSummary.innerHTML = `
        <h3>Ödeme Özeti</h3>
        <p><strong>Uçuş:</strong> ${bookingDetails.airline} - ${bookingDetails.flightNumber}</p>
        <p><strong>Güzergah:</strong> ${bookingDetails.departureCity} -> ${bookingDetails.arrivalCity}</p>
        <p><strong>Tarih:</strong> ${bookingDetails.departureDate}</p>
        <p><strong>Kalkış / Varış Saatleri:</strong> ${bookingDetails.departureTime} - ${bookingDetails.arrivalTime}</p>
        <p><strong>Sınıf:</strong> ${bookingDetails.seatClass}</p>
        <p><strong>Koltuklar:</strong> ${bookingDetails.selectedSeats.join(', ')}</p>
        <p class="total-amount"><strong>Toplam Tutar:</strong> ${bookingDetails.finalPrice.toFixed(2)} TL</p>
    `;

    payBtn.addEventListener('click', () => {
        const cardName = cardNameInput.value.trim();
        const cardNumber = cardNumberInput.value.replace(/\s/g, '');
        const expiryDate = expiryDateInput.value.replace('/', '');
        const cvc = cvcInput.value;

        if (!cardName || !/^\d{16}$/.test(cardNumber) || !/^\d{3}$/.test(cvc) || !/^\d{4}$/.test(expiryDate)) {
            alert('Lütfen kart bilgilerinizi eksiksiz ve doğru formatta girin.');
            return;
        }

        const month = parseInt(expiryDate.substring(0, 2), 10);
        const year = parseInt(expiryDate.substring(2, 4), 10);
        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1;

        if (month < 1 || month > 12 || (year < currentYear || (year === currentYear && month < currentMonth))) {
            alert('Kartınızın son kullanma tarihi geçersiz veya geçmiş.');
            return;
        }

        payBtn.disabled = true;
        payBtn.textContent = 'Ödeme İşleniyor...';

        setTimeout(() => {
            // 1. Oturumdan giriş yapmış kullanıcının e-postasını al
            const loggedInUserEmail = sessionStorage.getItem('loggedInUserEmail');
            
            // 2. Bilet objesine 'ownerEmail' anahtarını ekle
            // Giriş yapmış bir kullanıcı varsa, e-postasını bilet detaylarına ekle
            if (loggedInUserEmail) {
                bookingDetails.ownerEmail = loggedInUserEmail;
            } else {
                // Eğer bir sebepten kullanıcı girişi yoksa, işlemi durdur veya misafir olarak işaretle
                // Bu senaryoda misafir kullanıcıların biletlerini görmesi beklenmediği için null bırakabiliriz.
                bookingDetails.ownerEmail = null; 
            }

            // 3. Mevcut biletleri localStorage'dan çek, yoksa boş bir dizi oluştur
            let purchasedTickets = JSON.parse(localStorage.getItem('purchasedTickets')) || [];
            
            // 4. Yeni bileti dizinin sonuna ekle
            purchasedTickets.push(bookingDetails);
            
            // 5. Güncellenmiş bilet dizisini localStorage'a geri kaydet
            localStorage.setItem('purchasedTickets', JSON.stringify(purchasedTickets));
            
            // Ödemenin tamamlandığını oturumda işaretle
            sessionStorage.setItem('paymentComplete', 'true');

            console.log('Ödeme başarılı! Bilet', bookingDetails.pnr, 'sahibi', loggedInUserEmail, 'ile kalıcı olarak kaydedildi.');

            // 6. Onay sayfasına yönlendir
            window.location.href = 'confirmation.html';

        }, 1500); // Simülasyon gecikmesi
    });
});