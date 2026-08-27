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

    // Logic tính toán Timestamps (Đã thêm random icon)
    function processTimestamps() {
        const lines = tracklistInput.value.split('\n');
        let currentSeconds = 0;
        let result = [];
        let songNames = [];

        // Regex tìm thời lượng định dạng MM:SS hoặc HH:MM:SS ở cuối hoặc trong chuỗi
        const timeRegex = /(?:(\d{1,2}):)?(\d{1,2}):(\d{1,2})/;

        // Danh sách các icon để random (Bạn có thể thêm bớt tùy thích)
        const musicIcons = ['🎵', '🎶', '🎧', '💿', '✨', '🔥', '🎸', '🎹', '🎤'];

        lines.forEach(line => {
            const match = line.match(timeRegex);
            if (match && line.trim() !== '') {
                // Tính toán ra giây của bài hiện tại
                const hours = match[1] ? parseInt(match[1]) : 0;
                const minutes = parseInt(match[2]);
                const seconds = parseInt(match[3]);
                const durationInSeconds = (hours * 3600) + (minutes * 60) + seconds;

                // Tách tên bài hát (loại bỏ phần thời gian và các ký tự thừa)
                let title = line.replace(match[0], '').replace(/^[-|:\s]+|[-|:\s]+$/g, '').trim();
                
                // Bốc ngẫu nhiên 1 icon từ mảng musicIcons
                const randomIcon = musicIcons[Math.floor(Math.random() * musicIcons.length)];
                
                // Lưu timestamp cho bài này (chèn icon ngẫu nhiên vào giữa)
                result.push(`${formatTime(currentSeconds)} ${randomIcon} ${title}`);
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

    // Tạo Timestamp & AI SEO (Đã tối ưu Prompt chuẩn SEO)
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

        const prompt = `Bạn là một chuyên gia SEO YouTube và Copywriter đỉnh cao. Tôi có một video âm nhạc với danh sách các bài hát sau: ${songs.join(', ')}.
        
Nhiệm vụ của bạn là viết một phần mô tả video (description) thật lôi cuốn, chuẩn SEO để giữ chân người xem và tối ưu hóa thuật toán tìm kiếm của YouTube. 

Hãy áp dụng các nguyên tắc sau:
1. 3 Dòng Đầu Tiên (Cực kỳ quan trọng): Viết 1-2 câu "Hook" (câu mồi) thật giật gân, hấp dẫn và CHỨA TỪ KHÓA CHÍNH (tên bài hát nổi bật nhất hoặc thể loại nhạc).
2. Kêu gọi hành động (CTA) mạnh mẽ: Khuyến khích người xem Like, Đăng ký kênh và đặc biệt là KÊU GỌI BÌNH LUẬN (VD: "Bạn thích bài hát nào nhất trong playlist này? Comment cho mình biết nhé!").
3. Chèn từ khóa tự nhiên: Lồng ghép khéo léo các từ khóa mà người dùng hay tìm kiếm về thể loại nhạc này vào đoạn văn bản.
4. Trình bày thoáng, dễ đọc, sử dụng emoji phù hợp (không lạm dụng).

Hãy trình bày theo cấu trúc ví dụ sau:

🔥 [Câu Hook cực cuốn hút chứa từ khóa chính, ví dụ: "Chìm đắm trong không gian âm nhạc cực chill với những bản hit..." hoặc "Bùng nổ năng lượng với siêu phẩm remix..."]

🎧 Chào mừng bạn đến với playlist [Tên chủ đề/Thể loại nhạc]. Bản phối này là sự kết hợp hoàn hảo giữa những giai điệu cuốn hút, tiết tấu bắt tai và âm bass cực căng. Dù bạn đang cần năng lượng để làm việc, chạy bộ hay "quẩy" cùng bạn bè, đây chính là không gian âm nhạc dành cho bạn!

👇 Cùng thưởng thức và cho mình biết: BẠN THÍCH BÀI HÁT NÀO NHẤT TRONG PLAYLIST NÀY? Để lại bình luận phía dưới nhé!

❤️ Đừng quên LIKE 👍, CHIA SẺ 📤 và ĐĂNG KÝ 🔔 kênh để không bỏ lỡ những siêu phẩm âm nhạc mới nhất! Sự ủng hộ của bạn là động lực to lớn giúp kênh phát triển.

🎼 Thể loại: [Tên thể loại nhạc]
🎶 Không gian âm nhạc: [Mood nhạc, ví dụ: Thư giãn, Năng lượng, Chữa lành...]
🎧 Trải nghiệm tốt nhất: Đeo tai nghe hoặc mở loa chất lượng cao để cảm nhận trọn vẹn từng nhịp Bass!

✨ Bản quyền & Fair Use: Hình ảnh và hiệu ứng trong video được hỗ trợ bởi công nghệ AI, mang đến trải nghiệm nghe nhìn sinh động. Các tài nguyên được sử dụng hợp lý nhằm mục đích minh họa. Nếu có vấn đề về bản quyền, vui lòng liên hệ trực tiếp qua email, chúng tôi sẽ xử lý ngay lập tức.

Trả về kết quả ĐÚNG định dạng JSON sau (KHÔNG kèm markdown \`\`\`json, CHỈ trả về nguyên gốc JSON):
{
  "description": "Đoạn mô tả video được định dạng hấp dẫn theo cấu trúc trên. TUYỆT ĐỐI KHÔNG dùng ký tự markdown như **, *, _ để bôi đậm/in nghiêng, chỉ dùng văn bản thường và emoji.",
  "hashtags": "Tạo 5-8 hashtag tối ưu SEO, viết liền không dấu, có dấu # ở trước, cách nhau bởi khoảng trắng. Gồm: 1 hashtag tên kênh/đặc trưng, 2 hashtag tên bài hát hot nhất, 2 hashtag thể loại nhạc (VD: #NhacTre #RemixHayNhat #TopTrending).",
  "tags": "Tạo tối đa 15 thẻ tag cực chuẩn SEO, cách nhau bởi dấu phẩy. Bao gồm: các từ khóa dài (long-tail keywords) mà người dùng hay gõ tìm kiếm, tên bài hát (có dấu và không dấu), thể loại nhạc (VD: nhạc trẻ mới nhất, nhac tre remix, lofi chill, tổng hợp nhạc hay...)"
}`;

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.8 } 
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

    // Lấy toàn bộ nội dung đã tạo (Đã bỏ dải phân cách ===)
    function getFullOutput() {
        return `[MÔ TẢ VIDEO]\n` +
               `${outDescription.value}\n\n` +
               `[TIMESTAMPS]\n` +
               `${outTimestamps.value}\n\n` +
               `[HASHTAGS]\n` +
               `${outHashtags.value}\n\n` +
               `[TAGS]\n` +
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
