document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('chat-form');
    const input = document.getElementById('prompt-input') as HTMLInputElement;

    if (!form || !input) return;

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const prompt = input.value;
        if (!prompt) return;

        try {
            // Langkah 1: Dapatkan teks dari Gemini
            const textResponse = await fetch('http://localhost:8080/generate-text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            });
            const textData = await textResponse.json();
            const aiText = textData.response;
            
            console.log('Teks dari AI:', aiText);
            alert(`AI berkata: ${aiText}`); // Tetap tampilkan alert untuk debugging

            // Langkah 2: Ubah teks menjadi audio
            const audioResponse = await fetch('http://localhost:8080/generate-audio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: aiText }),
            });

            if (!audioResponse.ok) {
                throw new Error(`Gagal mengambil audio: ${audioResponse.statusText}`);
            }

            // Langkah 3: Putar audio
            const audioBlob = await audioResponse.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audio.play();

        } catch (error) {
            console.error('Terjadi kesalahan:', error);
            alert('Gagal memproses permintaan.');
        } finally {
            input.value = '';
        }
    });
});