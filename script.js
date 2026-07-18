document.addEventListener('DOMContentLoaded', () => {
    const tracklistInput = document.getElementById('tracklistInput');
    const songCount = document.getElementById('songCount');
    const outTimestamps = document.getElementById('outTimestamps');
    const totalDurationEl = document.getElementById('totalDuration');
    const outDescription = document.getElementById('outDescription');
    const outHashtags = document.getElementById('outHashtags');
    const outTags = document.getElementById('outTags');
    const loader = document.getElementById('loader');
    const outputContent = document.getElementById('outputContent');
    const apiKeyInput = document.getElementById('geminiApiKey');

    // Khôi phục API Key từ LocalStorage nếu có
    if (localStorage.getItem('geminiApiKey')) {
        apiKeyInput.value = localStorage.getItem('geminiApiKey');
    }

    // Cập nhật số lượng bài hát realtime
    tracklistInput.addEventListener('input', () => {
        const lines = tracklistInput.value.split('\n').filter(line => line.trim() !== '');
        songCount.innerText = `${lines.length} bài`;
    });

    // Helper: Chuyển đổi giây sang định dạng MM:SS hoặc HH:MM:SS
    function formatTime(totalSeconds) {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        
        const pad = (num) => num.toString().padStart(2, '0');
        if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
        return `${pad(m)}:${pad(s)}`;
    }

    // Logic tính toán Timestamps
    function processTimestamps() {
        const lines = tracklistInput.value.split('\n');
        let currentSeconds = 0;
        let result = [];
        let songNames = [];

        // Regex tìm thời lượng định dạng MM:SS hoặc HH:MM:SS ở cuối hoặc trong chuỗi
        const timeRegex = /(?:(\d{1,2}):)?(\d{1,2}):(\d{1,2})/;

        lines.forEach(line => {
            const match = line.match(timeRegex);
            if (match && line.trim() !== '') {
                // Tính toán ra giây của bài hiện tại
                const hours = match[1] ? parseInt(match[1]) : 0;
                const minutes = parseInt(match[2]);
                const seconds = parseInt(match[3]);
                const durationInSeconds = (hours * 3600) + (minutes * 60) + seconds;

                // Tách tên bài hát (loại bỏ phần thời gian và các ký tự thừa như '-', '|')
                let title = line.replace(match[0], '').replace(/^[-|:\s]+|[-|:\s]+$/g, '').trim();
                
                // Lưu timestamp cho bài này
                result.push(`${formatTime(currentSeconds)} ${title}`);
                songNames.push(title);

                // Cộng dồn thời gian cho bài tiếp theo
                currentSeconds += durationInSeconds;
            }
        });

        if(result.length === 0) return null;

        outTimestamps.value = result.join('\n');
        totalDurationEl.innerText = formatTime(currentSeconds);
        
        return songNames;
    }

    // Chỉ tính Timestamp (Không gọi AI)
    document.getElementById('calcOnlyBtn').addEventListener('click', () => {
        const songs = processTimestamps();
        if (!songs) {
            alert('Không tìm thấy bài hát nào hoặc sai định dạng thời gian. Vui lòng kiểm tra lại!');
        }
    });

    // Tạo Timestamp & AI SEO
    document.getElementById('generateBtn').addEventListener('click', async () => {
        const apiKey = apiKeyInput.value.trim();
        if (!apiKey) {
            alert('Vui lòng nhập Google Gemini API Key để sử dụng tính năng AI.');
            apiKeyInput.focus();
            return;
        }

        // Lưu API Key lại cho lần sau
        localStorage.setItem('geminiApiKey', apiKey);

        const songs = processTimestamps();
        if (!songs) {
            alert('Vui lòng nhập danh sách bài hát hợp lệ trước.');
            return;
        }

        // Hiện Loader
        outputContent.style.display = 'none';
        loader.style.display = 'block';

        const prompt = `Bạn là một chuyên gia SEO YouTube. Tôi có một video âm nhạc gồm danh sách các bài hát sau: ${songs.join(', ')}.
        
Yêu cầu bạn tạo nội dung SEO mới, hấp dẫn, không trùng lặp các lần trước. Trả về kết quả ĐÚNG định dạng JSON sau (không kèm markdown \`\`\`json):
{
  "description": "Đoạn mô tả video hấp dẫn, tự nhiên, chứa từ khóa (khoảng 3-4 câu).",
  "hashtags": "Danh sách hashtag viết liền, cách nhau bởi khoảng trắng (ví dụ: #NhacTre #TopTrending)",
  "tags": "Danh sách thẻ tag, cách nhau bởi dấu phẩy (ví dụ: nhạc trẻ, nhac tre, bài hát hay nhất)"
}`;

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.8 } // Tăng nhẹ temp để AI sáng tạo đa dạng hơn mỗi lần
                })
            });

            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error.message);
            }

            // Lấy text phản hồi và parse JSON
            let aiText = data.candidates[0].content.parts[0].text;
            // Dọn dẹp phòng trường hợp AI trả về markdown code block
            aiText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
            
            const seoData = JSON.parse(aiText);

            // Cập nhật giao diện
            outDescription.value = seoData.description || '';
            outHashtags.value = seoData.hashtags || '';
            outTags.value = seoData.tags || '';

        } catch (error) {
            alert('Lỗi khi gọi AI: ' + error.message);
            console.error(error);
        } finally {
            // Tắt Loader
            loader.style.display = 'none';
            outputContent.style.display = 'block';
        }
    });

    // Lấy toàn bộ nội dung đã tạo
    function getFullOutput() {
        return `========================================\n` +
               `MÔ TẢ VIDEO\n` +
               `========================================\n` +
               `${outDescription.value}\n\n` +
               `========================================\n` +
               `TIMESTAMPS\n` +
               `========================================\n` +
               `${outTimestamps.value}\n\n` +
               `========================================\n` +
               `HASHTAGS\n` +
               `========================================\n` +
               `${outHashtags.value}\n\n` +
               `========================================\n` +
               `TAGS\n` +
               `========================================\n` +
               `${outTags.value}`;
    }

    // 1-Click Copy
    document.getElementById('copyAllBtn').addEventListener('click', async () => {
        const text = getFullOutput();
        try {
            await navigator.clipboard.writeText(text);
            alert('Đã copy toàn bộ nội dung thành công!');
        } catch (err) {
            alert('Lỗi copy: ' + err);
        }
    });

    // Xuất file TXT
    document.getElementById('exportTxtBtn').addEventListener('click', () => {
        const text = getFullOutput();
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'YouTube_SEO_Result.txt';
        a.click();
        URL.revokeObjectURL(url);
    });

    // Xuất file DOCX (Sử dụng cách bọc HTML đơn giản vào file .doc)
    document.getElementById('exportDocxBtn').addEventListener('click', () => {
        const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>YouTube SEO</title></head><body>";
        const footer = "</body></html>";
        const content = `
            <h2>MÔ TẢ VIDEO</h2><p>${outDescription.value.replace(/\n/g, '<br>')}</p>
            <h2>TIMESTAMPS</h2><p>${outTimestamps.value.replace(/\n/g, '<br>')}</p>
            <h2>HASHTAGS</h2><p>${outHashtags.value}</p>
            <h2>TAGS</h2><p>${outTags.value}</p>
        `;
        const html = header + content + footer;
        const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'YouTube_SEO_Result.doc';
        a.click();
        URL.revokeObjectURL(url);
    });
});