document.addEventListener('DOMContentLoaded', () => {
    const tracklistInput = document.getElementById('tracklistInput');
    const songCount = document.getElementById('songCount');
    const outTimestamps = document.getElementById('outTimestamps');
    const totalDurationEl = document.getElementById('totalDuration');
    const outDescription = document.getElementById('outDescription');
    const outHashtags = document.getElementById('outHashtags');
    const outTags = document.getElementById('outTags');
    const outTitle1 = document.getElementById('outTitle1');
    const outTitle2 = document.getElementById('outTitle2');
    const outTitle3 = document.getElementById('outTitle3');
    const countTitle1 = document.getElementById('countTitle1');
    const countTitle2 = document.getElementById('countTitle2');
    const countTitle3 = document.getElementById('countTitle3');
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

    // Helper: Cập nhật đếm ký tự cho tiêu đề
    function updateCharCount(inputEl, counterEl) {
        if (!inputEl || !counterEl) return;
        const len = inputEl.value.length;
        counterEl.innerText = `${len}/100 ký tự`;
        if (len > 100) {
            counterEl.style.color = '#ff4757';
        } else if (len >= 55 && len <= 85) {
            counterEl.style.color = 'var(--success-color)';
        } else {
            counterEl.style.color = 'var(--text-muted)';
        }
    }

    function updateAllTitleCounts() {
        updateCharCount(outTitle1, countTitle1);
        updateCharCount(outTitle2, countTitle2);
        updateCharCount(outTitle3, countTitle3);
    }

    [outTitle1, outTitle2, outTitle3].forEach((input, idx) => {
        const counter = [countTitle1, countTitle2, countTitle3][idx];
        if (input && counter) {
            input.addEventListener('input', () => updateCharCount(input, counter));
        }
    });

    // Sự kiện sao chép từng tiêu đề
    document.querySelectorAll('.btn-copy-single').forEach(btn => {
        btn.addEventListener('click', async () => {
            const targetId = btn.getAttribute('data-target');
            const targetInput = document.getElementById(targetId);
            if (!targetInput || !targetInput.value.trim()) {
                alert('Chưa có tiêu đề để sao chép!');
                return;
            }
            try {
                await navigator.clipboard.writeText(targetInput.value.trim());
                const originalHtml = btn.innerHTML;
                btn.classList.add('copied');
                btn.innerHTML = '<i class="fas fa-check"></i> <span>Đã chép!</span>';
                setTimeout(() => {
                    btn.classList.remove('copied');
                    btn.innerHTML = originalHtml;
                }, 2000);
            } catch (err) {
                targetInput.select();
                document.execCommand('copy');
                alert('Đã sao chép tiêu đề thành công!');
            }
        });
    });

    // Tạo tiêu đề mẫu dự phòng (khi chỉ tính timestamp hoặc chưa gọi AI)
    function generateDefaultTitles(songNames) {
        if (!songNames || songNames.length === 0) return;
        const s1 = songNames[0];
        const s2 = songNames.length > 1 ? songNames[1] : '';
        const s3 = songNames.length > 2 ? songNames[2] : '';
        const currentYear = new Date().getFullYear();

        const t1 = `🔥 ${s1} - Tuyển Tập Nhạc Trẻ Hot Tik Tok Triệu View Mới Nhất ${currentYear}`;
        const t2 = s2
            ? `🎧 Nghe Là Nghiện | ${s1} - ${s2} Remix Bass Cực Căng Cuốn Hút`
            : `🎧 Nghe Là Nghiện | ${s1} Bản Remix Bass Cực Căng Gây Sốt`;
        const sample = [s1, s2, s3].filter(Boolean).join(', ');
        const t3 = `✨ BXH Nhạc Tuyển Chọn Hay Nhất | ${sample} (Top Trending)`;

        outTitle1.value = t1;
        outTitle2.value = t2;
        outTitle3.value = t3;
        updateAllTitleCounts();
    }

    // Tạo mô tả mẫu biến tấu theo bài hát (khi chỉ tính timestamp)
    function generateDefaultDescription(songNames) {
        if (!songNames || songNames.length === 0) return '';
        const s1 = songNames[0];
        const otherSongs = songNames.slice(1, 4).join(', ');
        const currentYear = new Date().getFullYear();
        return `🎧 ${s1} – Bản phối âm nhạc sôi động với giai điệu cuốn hút, tiết tấu bắt tai cùng những đoạn bass mạnh mẽ, mang đến bầu không khí bùng nổ và đầy cảm xúc. Đây là tuyển tập lý tưởng dành cho những ai yêu thích âm nhạc năng lượng (${s1}${otherSongs ? ', ' + otherSongs : ''}), giúp khuấy động mọi khoảnh khắc từ thư giãn đến những cuộc vui.\n\n` +
               `🔥 Tăng âm lượng, đeo tai nghe hoặc mở trên hệ thống loa chất lượng để cảm nhận trọn vẹn từng nhịp bass và giai điệu đầy mê hoặc.\n\n` +
               `❤️ Nếu bạn yêu thích video này, đừng quên Like 👍 • Chia sẻ 📤 • Đăng ký 🔔 kênh của tôi để luôn cập nhật những bản nhạc, playlist và video âm nhạc mới nhất.\n\n` +
               `🎼 Thể loại: Nhạc Trẻ Hot Trend ${currentYear}\n` +
               `🎶 Phong cách: Bắt tai, lôi cuốn, gây nghiện\n` +
               `🎧 Trải nghiệm tốt nhất: Nghe bằng tai nghe hoặc loa chất lượng để tận hưởng âm thanh sống động.\n\n` +
               `✨ Lưu ý: Hình ảnh minh họa, thumbnail và hiệu ứng sóng nhạc trong video được thiết kế với sự hỗ trợ của công nghệ AI hiện đại, góp phần mang đến trải nghiệm nghe nhìn sinh động và hấp dẫn hơn.`;
    }

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
            return;
        }
        generateDefaultTitles(songs);
        outDescription.value = generateDefaultDescription(songs);
        outHashtags.value = songs.slice(0, 5).map(s => '#' + s.replace(/[\s\-_|]+/g, '')).join(' ') + ' #NhacTre #TopTrending';
        outTags.value = songs.slice(0, 8).join(', ') + ', nhac tre, top trending, bài hát hay nhất';
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

        const currentYear = new Date().getFullYear();
        const firstSong = songs[0];
        const highlightSongs = songs.slice(0, 5).join(', ');

        const prompt = `Bạn là một chuyên gia sáng tạo nội dung âm nhạc và SEO YouTube hàng đầu.
Tôi có một video âm nhạc gồm danh sách các bài hát sau: ${songs.join(', ')}.

Yêu cầu bạn phân tích kỹ danh sách bài hát trên để tạo nội dung SEO tối ưu nhất giúp video tiếp cận lượng tìm kiếm tự nhiên cực lớn trên YouTube (YouTube Search) và tăng tối đa tỷ lệ nhấp chuột (High CTR):

1. Tạo 3 TIÊU ĐỀ HOT (độ dài lý tưởng 60 - 85 ký tự, không vượt quá 100 ký tự, có emoji bắt mắt, viết hoa điểm nhấn, chứa từ khóa hot):
- title1 (Xu Hướng & Trending Hot): Đón đầu xu hướng, kết hợp tên bài hát hot nhất (${firstSong}) + từ khóa xu hướng âm nhạc hot (Ví dụ: [Tên bài hot] - Tuyển Tập Nhạc Trẻ Hot Tik Tok Triệu View Mới Nhất ${currentYear}).
- title2 (Kích Thích Tò Mò & High CTR): Giật tít cảm xúc mạnh, cuốn hút người nghe nhấp vào ngay (Ví dụ: Nghe Là Nghiện - [Tên bài] Bản Remix Bass Cực Căng Gây Sốt).
- title3 (Chuẩn Tìm Kiếm YouTube Search): Tối đa hóa từ khóa tìm kiếm tự nhiên của khán giả, chứa tên các bài hát chính kèm cụm từ người nghe hay gõ tìm kiếm.

2. Tạo MÔ TẢ (Description) BIẾN TẤU SÁNG TẠO - TUYỆT ĐỐI KHÔNG RẬP KHUÔN:
- QUY TẮC CỐT LÕI: Luôn biến tấu sáng tạo, không rập khuôn hay sao chép nguyên văn mẫu. Hãy dựa trực tiếp vào tiêu đề bài hát đầu tiên (${firstSong}) và phong cách các bài hát trong danh sách (${highlightSongs}) để viết mô tả sống động, phù hợp chính xác với thể loại (Remix sôi động, Pop Ballad, Lofi Chill, Vinahouse...). Mỗi lần sinh nội dung phải có cách dùng từ, ví von và nhịp điệu câu văn mới mẻ.
- Cấu trúc trình bày hấp dẫn với các icon thu hút:

🎧 [Tên bài hát đầu tiên: ${firstSong} hoặc Tên playlist] – [Đoạn văn biến tấu linh hoạt theo tên và phong cách bài hát: miêu tả bản phối âm nhạc, tiết tấu bắt tai, giai điệu cuốn hút, những đoạn drop/bass hoặc giai điệu sâu lắng, mang đến bầu không khí đầy cảm xúc và là lựa chọn lý tưởng để tận hưởng từ thư giãn đến những cuộc vui bùng nổ].

🔥 Tăng âm lượng, đeo tai nghe hoặc mở trên hệ thống loa chất lượng để cảm nhận trọn vẹn từng nhịp bass và giai điệu đầy mê hoặc.

❤️ Nếu bạn yêu thích video này, đừng quên Like 👍 • Chia sẻ 📤 • Đăng ký 🔔 kênh của tôi để luôn cập nhật những bản nhạc, playlist và video âm nhạc mới nhất.

🎼 Thể loại: [Thể loại nhạc tự động xác định theo bài hát]
🎶 Phong cách: [Phong cách âm nhạc tương ứng]
🎧 Trải nghiệm tốt nhất: Nghe bằng tai nghe hoặc loa chất lượng để tận hưởng âm thanh sống động.

✨ Lưu ý: Hình ảnh minh họa, thumbnail và hiệu ứng sóng nhạc trong video được thiết kế với sự hỗ trợ của công nghệ AI hiện đại, góp phần mang đến trải nghiệm nghe nhìn sinh động và hấp dẫn hơn.

YÊU CẦU ĐẶC BIỆT:
- TUYỆT ĐỐI KHÔNG sử dụng các ký tự đặc biệt dùng để định dạng văn bản (như dấu **, dấu *, dấu _, v.v.) trong phần mô tả, chỉ được phép sử dụng văn bản thường và các icon (emoji).
- Trả về kết quả ĐÚNG định dạng JSON sau (không kèm markdown \`\`\`json):
{
  "title1": "Tiêu đề 1 xu hướng & trending...",
  "title2": "Tiêu đề 2 kích thích tò mò high CTR...",
  "title3": "Tiêu đề 3 chuẩn tìm kiếm YouTube SEO...",
  "description": "Đoạn mô tả hoàn chỉnh được biến tấu sáng tạo theo phong cách và tên bài hát...",
  "hashtags": "Danh sách hashtag viết liền, cách nhau bởi khoảng trắng, bao gồm tên bài hát, thể loại (ví dụ: #NhacTre #TopTrending)",
  "tags": "Danh sách thẻ tag, cách nhau bởi dấu phẩy (ví dụ: nhạc trẻ, nhac tre, bài hát hay nhất)"
}`;

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.85 } // Tăng nhẹ temp để AI sáng tạo đa dạng hơn mỗi lần
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

            // Làm sạch chuỗi tiêu đề
            const cleanTitle = (val) => {
                if (!val) return '';
                return String(val).replace(/^["'\d\.\-\s]+/, '').replace(/["']+$/, '').trim();
            };

            const t1 = cleanTitle(seoData.title1 || (Array.isArray(seoData.titles) ? seoData.titles[0] : ''));
            const t2 = cleanTitle(seoData.title2 || (Array.isArray(seoData.titles) ? seoData.titles[1] : ''));
            const t3 = cleanTitle(seoData.title3 || (Array.isArray(seoData.titles) ? seoData.titles[2] : ''));

            outTitle1.value = t1;
            outTitle2.value = t2;
            outTitle3.value = t3;
            updateAllTitleCounts();

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
        let titlesBlock = '';
        if (outTitle1.value || outTitle2.value || outTitle3.value) {
            titlesBlock = `TIÊU ĐỀ GỢI Ý:\n` +
                          `1. ${outTitle1.value}\n` +
                          `2. ${outTitle2.value}\n` +
                          `3. ${outTitle3.value}\n\n`;
        }
        return titlesBlock +
               `MÔ TẢ VIDEO:\n` +
               `${outDescription.value}\n\n` +
               `TIMESTAMPS:\n` +
               `${outTimestamps.value}\n\n` +
               `HASHTAGS:\n` +
               `${outHashtags.value}\n\n` +
               `TAGS:\n` +
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
        const titlesDocx = (outTitle1.value || outTitle2.value || outTitle3.value) ? `
            <h2>GỢI Ý TIÊU ĐỀ SEO YOUTUBE</h2>
            <p><strong>1. Trending Hot:</strong> ${outTitle1.value}</p>
            <p><strong>2. High CTR:</strong> ${outTitle2.value}</p>
            <p><strong>3. YouTube SEO Search:</strong> ${outTitle3.value}</p>
        ` : '';
        const content = `
            ${titlesDocx}
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
