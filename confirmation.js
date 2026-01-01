document.addEventListener('DOMContentLoaded', () => {
    const confirmationMessage = document.getElementById('confirmation-message');
    const homeBtn = document.getElementById('home-btn');

    const bookingDetails = JSON.parse(sessionStorage.getItem('bookingDetails'));
    const paymentComplete = sessionStorage.getItem('paymentComplete');

    if (!bookingDetails || !paymentComplete) {
        window.location.href = 'index.html';
        return;
    }

    const pnrLine = bookingDetails.pnr ? `<p>Biletiniz başarıyla oluşturulmuştur. PNR kodunuz: <strong>${bookingDetails.pnr}</strong></p>` : '';
    const passengerNames = bookingDetails.passengers.map(p => `${p.name} ${p.surname}`).join(', ');

    // E-posta alıcılarını belirle
    const loggedInUserEmail = sessionStorage.getItem('loggedInUserEmail');
    const primaryRecipient = loggedInUserEmail || (bookingDetails.passengers[0] ? bookingDetails.passengers[0].email : 'belirtilen e-posta adresine');
    const parentEmails = bookingDetails.passengers
        .filter(p => p.isChild && p.parentInfo && p.parentInfo.email)
        .map(p => p.parentInfo.email);
    const uniqueParentEmails = [...new Set(parentEmails)];

    let emailRecipients = `<strong>${primaryRecipient}</strong>`;
    if (uniqueParentEmails.length > 0) {
        emailRecipients += ` ve veli/ebeveyn e-posta adres(ler)i <strong>${uniqueParentEmails.join(', ')}</strong>`;
    }

    // Onay mesajını ve bilet özetini oluştur
    confirmationMessage.innerHTML = `
        <p>Ödemeniz başarıyla tamamlanmıştır.</p>
        ${pnrLine}
        <div class="ticket-summary" style="border: 1px solid #ccc; padding: 15px; margin-top: 20px; border-radius: 5px;">
            <h4 style="margin-top: 0;">Bilet Özeti</h4>
            <p><strong>Nereden:</strong> ${bookingDetails.departureCity}</p>
            <p><strong>Nereye:</strong> ${bookingDetails.arrivalCity}</p>
            <p><strong>Gidiş Tarihi:</strong> ${bookingDetails.departureDate}</p>
            <p><strong>Kalkış / Varış Saatleri:</strong> ${bookingDetails.departureTime} - ${bookingDetails.arrivalTime}</p>
            <p><strong>Yolcular:</strong> ${passengerNames}</p>
        </div>
        <p style="margin-top: 20px;">Bilet bilgilerinizin tüm detayları ${emailRecipients} adresine e-posta olarak gönderilmiştir.</p>
        <p>İyi uçuşlar dileriz!</p>
    `;

    console.log('Final booking confirmed:', bookingDetails);
    console.log(`(Simulated) Tickets sent to recipients: ${emailRecipients}`);

    homeBtn.addEventListener('click', () => {
        sessionStorage.removeItem('bookingDetails');
        sessionStorage.removeItem('paymentComplete');
        window.location.href = 'index.html';
    });
});