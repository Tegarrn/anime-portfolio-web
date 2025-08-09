import { startTalking, stopTalking } from './vrm-loader';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('chat-form');
    const input = document.getElementById('prompt-input') as HTMLInputElement;
    const submitButton = form?.querySelector('button');

    if (!form || !input || !submitButton) return;

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const prompt = input.value;
        if (!prompt) return;

        submitButton.disabled = true;
        submitButton.textContent = "Berpikir...";

        try {
            const textResponse = await fetch('http://localhost:8080/generate-text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            });
            const textData = await textResponse.json();
            const aiText = textData.response;

            console.log('Teks dari AI:', aiText);

            const audioResponse = await fetch('http://localhost:8080/generate-audio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: aiText }),
            });

            if (!audioResponse.ok) {
                throw new Error(`Gagal mengambil audio: ${audioResponse.statusText}`);
            }

            const audioBlob = await audioResponse.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);

            startTalking();
            audio.play();

            audio.onended = () => {
                stopTalking();
            };

        } catch (error) {
            console.error('Terjadi kesalahan:', error);
            alert('Gagal memproses permintaan.');
            stopTalking();
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Kirim";
            input.value = '';
        }
    });
});