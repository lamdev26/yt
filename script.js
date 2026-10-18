document.addEventListener('DOMContentLoaded', () => {
    const tracklistInput = document.getElementById('tracklistInput');
    const songCount = document.getElementById('songCount');
    const outTimestamps = document.getElementById('outTimestamps');
    const totalDurationEl = document.getElementById('totalDuration');
    const outDescription = document.getElementById('outDescription');
    const outHashtags = document.getElementById('outHashtags');
    const outTags = document.getElementById('outTags');
    const tagsCount = document.getElementById('tagsCount');
    const outTitle1 = document.getElementById('outTitle1');
    const outTitle2 = document.getElementById('outTitle2');
    const outTitle3 = document.getElementById('outTitle3');
    const countTitle1 = document.getElementById('countTitle1');
    const countTitle2 = document.getElementById('countTitle2');
    const countTitle3 = document.getElementById('countTitle3');
    const loader = document.getElementById('loader');
    const outputContent = document.getElementById('outputContent');
    const emptyOutput = document.getElementById('emptyOutput');
    const seoExportActions = document.getElementById('seoExportActions');
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

    // Helper: Cập nhật đếm ký tự cho Tags (YouTube tối đa 450 ký tự)
    function updateTagsCount() {
        if (!outTags || !tagsCount) return;
        const len = outTags.value.length;
        tagsCount.innerText = `${len}/450 ký tự`;
        if (len > 450) {
            tagsCount.style.color = '#ff4757';
            tagsCount.style.fontWeight = 'bold';
        } else if (len >= 300) {
            tagsCount.style.color = 'var(--success-color)';
            tagsCount.style.fontWeight = 'normal';
        } else {
            tagsCount.style.color = 'var(--text-muted)';
            tagsCount.style.fontWeight = 'normal';
        }
    }

    if (outTags) {
        outTags.addEventListener('input', () => {
            updateTagsCount();
        });
    }

    [outTitle1, outTitle2, outTitle3].forEach((input, idx) => {
        const counter = [countTitle1, countTitle2, countTitle3][idx];
        if (input && counter) {
            input.addEventListener('input', () => {
                input.value = input.value.toLocaleUpperCase('vi-VN');
                updateCharCount(input, counter);
            });
        }
    });

    // Sự kiện sao chép 1-click cho tất cả các nút copy riêng lẻ (Tiêu đề, Mô tả, Timestamps, Hashtags, Tags)
    document.querySelectorAll('.btn-copy-single, .btn-copy-section').forEach(btn => {
        btn.addEventListener('click', async () => {
            const targetId = btn.getAttribute('data-target');
            const targetInput = document.getElementById(targetId);
            if (!targetInput || !targetInput.value.trim()) {
                alert('Chưa có nội dung để sao chép!');
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
                alert('Đã sao chép nội dung thành công!');
            }
        });
    });

    // Helper: Định dạng tiêu đề CHỮ IN HOA 100%, KHÔNG ICON Ở ĐẦU, có tiền tố chuẩn (LK, BXH, NONSTOP)
    function formatUppercaseTitle(titleStr, defaultPrefix = 'LK:') {
        if (!titleStr) return '';
        let str = String(titleStr).trim();
        
        // 1. Loại bỏ tất cả emoji/icon hoặc ký tự đặc biệt ở ĐẦU chuỗi
        str = str.replace(/^[\p{Extended_Pictographic}\p{Emoji}\s\-_|:•★🔥⚡🎧🎶✨]+/u, '').trim();
        // Loại bỏ số thứ tự 1., 2., 3. hoặc dấu ngoặc kép ở đầu/cuối
        str = str.replace(/^["'\d\.\-\s]+/, '').replace(/["']+$/, '').trim();
        // Tiếp tục loại bỏ icon nếu AI trả về dạng "1. 🔥 Tên bài"
        str = str.replace(/^[\p{Extended_Pictographic}\p{Emoji}\s\-_|:•★🔥⚡🎧🎶✨]+/u, '').trim();
        
        // 2. Chuyển toàn bộ chuỗi sang IN HOA 100% tiếng Việt
        str = str.toLocaleUpperCase('vi-VN');
        
        // 3. Kiểm tra tiền tố chuẩn ở đầu (LK, BXH, NONSTOP, TOP, ALBUM)
        const prefixRegex = /^(LK|BXH|TOP|NONSTOP|ALBUM|REMIX)\s*:/i;
        if (!prefixRegex.test(str)) {
            str = `${defaultPrefix} ${str}`;
        } else {
            str = str.replace(prefixRegex, (match, p1) => `${p1.toUpperCase()}:`);
        }
        
        // 4. Đảm bảo toàn bộ chữ in hoa 100% và không vượt quá 100 ký tự
        str = str.toLocaleUpperCase('vi-VN').trim();
        if (str.length > 100) {
            str = str.substring(0, 99).trim();
        }
        return str;
    }

    // Helper: Định dạng Tags YouTube tối đa 450 ký tự (chuẩn SEO YouTube, tránh lỗi khi paste vào YouTube Studio)
    function formatYouTubeTags(rawTags) {
        if (!rawTags) return '';
        let str = String(rawTags).replace(/[\r\n]+/g, ' ').trim();
        // Chuẩn hóa dấu phẩy và khoảng trắng thừa
        str = str.replace(/\s*,\s*/g, ', ');
        str = str.replace(/,\s*,+/g, ', ').replace(/\s+/g, ' ');
        // Bỏ dấu phẩy ở đầu/cuối nếu có
        str = str.replace(/^,\s*/, '').replace(/,\s*$/, '').trim();

        if (str.length <= 450) {
            return str;
        }

        // Cắt bớt sao cho <= 450 ký tự tại vị trí dấu phẩy hợp lệ gần nhất
        let truncated = str.substring(0, 450);
        const lastComma = truncated.lastIndexOf(',');
        if (lastComma > 0) {
            truncated = truncated.substring(0, lastComma).trim();
        } else {
            truncated = truncated.trim();
        }
        return truncated;
    }

    // Tạo tiêu đề mẫu dự phòng (khi chỉ tính timestamp hoặc chưa gọi AI)
    function generateDefaultTitles(songNames) {
        if (!songNames || songNames.length === 0) return;
        const s1 = songNames[0];
        const s2 = songNames.length > 1 ? songNames[1] : '';
        const s3 = songNames.length > 2 ? songNames[2] : '';
        const currentYear = new Date().getFullYear();

        const s1Upper = s1.toLocaleUpperCase('vi-VN');
        const s2Upper = s2 ? s2.toLocaleUpperCase('vi-VN') : '';
        const sampleUpper = [s1, s2, s3].filter(Boolean).map(s => s.toLocaleUpperCase('vi-VN')).join(', ');

        const t1 = `LK ${s1Upper} - TUYỂN TẬP NHẠC TRẺ REMIX HOT TIK TOK TRIỆU VIEW MỚI NHẤT ${currentYear}`;
        const t2 = s2
            ? `BXH BẢNG XẾP HẠNG NHẠC REMIX BASS CỰC CĂNG ĐỐN TIM - ${s1Upper} X ${s2Upper}`
            : `BXH BẢNG XẾP HẠNG NHẠC REMIX GÂY NGHIỆN - ${s1Upper} BASS CỰC CĂNG`;
        const t3 = `NONSTOP LIÊN KHÚC NHẠC REMIX HAY NHẤT TRIỆU VIEW - ${sampleUpper}`;

        outTitle1.value = formatUppercaseTitle(t1, 'LK');
        outTitle2.value = formatUppercaseTitle(t2, 'BXH');
        outTitle3.value = formatUppercaseTitle(t3, 'NONSTOP');
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
        outHashtags.value = songs.slice(0, 5).map(s => '#' + s.replace(/[\s\-_|]+/g, '')).join(' ') + ' #remix #nhacremix #nhactreremix #nhachaymoingay #giaitri #NhacTre #TopTrending';
        outTags.value = formatYouTubeTags(songs.slice(0, 8).join(', ') + ', nhac tre, top trending, bài hát hay nhất');
        updateTagsCount();

        // Ẩn trạng thái rỗng và hiển thị kết quả
        if (emptyOutput) emptyOutput.style.display = 'none';
        loader.style.display = 'none';
        outputContent.style.display = 'block';
        if (seoExportActions) seoExportActions.style.display = 'flex';
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

        // Ẩn trạng thái rỗng và kết quả cũ, hiện Loader
        if (emptyOutput) emptyOutput.style.display = 'none';
        outputContent.style.display = 'none';
        loader.style.display = 'block';
        if (seoExportActions) seoExportActions.style.display = 'none';

        const currentYear = new Date().getFullYear();
        const firstSong = songs[0];
        const highlightSongs = songs.slice(0, 5).join(', ');

        const prompt = `Bạn là một chuyên gia sáng tạo nội dung âm nhạc và SEO YouTube hàng đầu.
Tôi có một video âm nhạc gồm danh sách các bài hát sau: ${songs.join(', ')}.

Yêu cầu bạn phân tích kỹ danh sách bài hát trên để tạo nội dung SEO tối ưu nhất giúp video tiếp cận lượng tìm kiếm tự nhiên cực lớn trên YouTube (YouTube Search) và tăng tối đa tỷ lệ nhấp chuột (High CTR):

1. TẠO 3 TIÊU ĐỀ YOUTUBE HOT (ĐỘ DÀI LÝ TƯỞNG 60 - 85 KÝ TỰ, TỐI ĐA 100 KÝ TỰ):
QUY TẮC CỐT LÕI BẮT BUỘC:
- TOÀN BỘ TIÊU ĐỀ BẮT BUỘC PHẢI VIẾT HOA 100% (CHỮ IN HOA TOÀN BỘ TIẾNG VIỆT).
- KÝ TỰ ĐẦU TIÊN CỦA TIÊU ĐỀ TUYỆT ĐỐI KHÔNG ĐƯỢC CHỨA BẤT KỲ ICON / EMOJI NÀO!
- BẮT BUỘC BẮT ĐẦU BẰNG CÁC TIỀN TỐ VIẾT TẮT PHỔ BIẾN TRÊN YOUTUBE:
  + "LK" (viết tắt của Liên Khúc)
  + "BXH" (viết tắt của Bảng Xếp Hạng)
  + "NONSTOP" hoặc "TOP"
  (Ví dụ: LK THƯƠNG EM REMIX - TUYỂN TẬP NHẠC TRẺ HOT TIK TOK 2026)
  (Ví dụ: BXH BẢNG XẾP HẠNG NHẠC REMIX BASS CỰC CĂNG ĐỐN TIM)
  (Ví dụ: NONSTOP LIÊN KHÚC REMIX HAY NHẤT TRIỆU VIEW)

- title1 (Xu Hướng & Trending Hot): Bắt đầu bằng "LK", kết hợp tên bài hát hot nhất (${firstSong.toUpperCase()}) + từ khóa xu hướng âm nhạc hot. VIẾT HOA 100%, TUYỆT ĐỐI KHÔNG ICON Ở ĐẦU.
- title2 (Kích Thích Tò Mò & High CTR): Bắt đầu bằng "BXH", giật tít cảm xúc mạnh (NGHE LÀ PHÊ, BASS CỰC CĂNG, ĐỐN TIM, GÂY NGHIỆN...). VIẾT HOA 100%, TUYỆT ĐỐI KHÔNG ICON Ở ĐẦU.
- title3 (Chuẩn Tìm Kiếm YouTube Search): Bắt đầu bằng "NONSTOP" hoặc "LK", tối đa hóa từ khóa tìm kiếm tự nhiên, chứa tên các bài hát chính kèm cụm từ khán giả hay gõ tìm kiếm. VIẾT HOA 100%, TUYỆT ĐỐI KHÔNG ICON Ở ĐẦU.

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
- THẺ TAG (tags): Tổng độ dài của chuỗi thẻ tag phân cách bởi dấu phẩy BẮT BUỘC TỐI ĐA 450 KÝ TỰ (YouTube giới hạn 500 ký tự, nên phải dưới 450 ký tự để không bao giờ bị lỗi khi paste vào YouTube Studio). Chọn lọc các từ khóa SEO đắt giá nhất.
- Trả về kết quả ĐÚNG định dạng JSON sau (không kèm markdown \`\`\`json):
{
  "title1": "LK TIÊU ĐỀ 1 IN HOA 100% KHÔNG ICON Ở ĐẦU...",
  "title2": "BXH TIÊU ĐỀ 2 IN HOA 100% KHÔNG ICON Ở ĐẦU...",
  "title3": "NONSTOP TIÊU ĐỀ 3 IN HOA 100% KHÔNG ICON Ở ĐẦU...",
  "description": "Đoạn mô tả hoàn chỉnh được biến tấu sáng tạo theo phong cách và tên bài hát...",
  "hashtags": "Danh sách hashtag viết liền, cách nhau bởi khoảng trắng, bao gồm tên bài hát, thể loại (ví dụ: #remix #nhacremix #nhactreremix #nhachaymoingay #giaitri #NhacTre #TopTrending...)",
  "tags": "Danh sách thẻ tag cách nhau bởi dấu phẩy, CHỌN LỌC TỐI ĐA 450 KÝ TỰ (ví dụ: nhạc trẻ, nhac tre, bài hát hay nhất)"
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

            outTitle1.value = formatUppercaseTitle(seoData.title1 || (Array.isArray(seoData.titles) ? seoData.titles[0] : ''), 'LK');
            outTitle2.value = formatUppercaseTitle(seoData.title2 || (Array.isArray(seoData.titles) ? seoData.titles[1] : ''), 'BXH');
            outTitle3.value = formatUppercaseTitle(seoData.title3 || (Array.isArray(seoData.titles) ? seoData.titles[2] : ''), 'NONSTOP');
            updateAllTitleCounts();

            // Cập nhật giao diện
            outDescription.value = seoData.description || '';
            outHashtags.value = seoData.hashtags || '';
            outTags.value = formatYouTubeTags(seoData.tags || '');
            updateTagsCount();

        } catch (error) {
            alert('Lỗi khi gọi AI: ' + error.message);
            console.error(error);
        } finally {
            // Tắt Loader
            loader.style.display = 'none';
            if (outTitle1.value || outDescription.value) {
                outputContent.style.display = 'block';
                if (seoExportActions) seoExportActions.style.display = 'flex';
            } else {
                if (emptyOutput) emptyOutput.style.display = 'flex';
            }
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
        if (!outDescription.value && !outTimestamps.value && !outTitle1.value) {
            alert('Chưa có nội dung kết quả để sao chép!');
            return;
        }
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
        if (!outDescription.value && !outTimestamps.value && !outTitle1.value) {
            alert('Chưa có nội dung kết quả để xuất file!');
            return;
        }
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
        if (!outDescription.value && !outTimestamps.value && !outTitle1.value) {
            alert('Chưa có nội dung kết quả để xuất DOCX!');
            return;
        }
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

    // ==========================================
    // CHUYỂN TAB (YouTube SEO <-> Suno AI Studio)
    // ==========================================
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            const targetPane = document.getElementById(targetTab);
            if (targetPane) targetPane.classList.add('active');
        });
    });

    // ==========================================
    // SUNO AI STUDIO LOGIC & PRESETS
    // ==========================================
    const SUNO_PRESETS = {
        1: {
            id: 1,
            name: "Rap Pop x Jersey Club x Afrobeat",
            bpm: 128,
            title: "Khiêu Vũ Dưới Ngàn Sao",
            style: "Rap Pop with Jersey Club x Afrobeat production, 128 BPM bouncy Jersey bounce, beat drops and building-up transitions, funky bass, heavy sub bass, bright synths, soft sweet high female vocals, natural male melodic rap, playful female rap, energetic male-female duet hooks. African log drum accents, syncopated bed squeak percussion, punchy Jersey kick triplets, smooth melodic guitar riffs, lush atmospheric vocal pads, snappy clap patterns. Dynamic contrast between intimate melodic rap verses and explosive anthemic chorus drops. Theme: playful romantic chemistry, youthful energy, late-night vibes. Wide stereo panning, deep clean 808 glide, pristine upfront vocal mix, radio-ready commercial master. NO monotone rap, NO mumble, NO muddy low-end, NO robotic vocal tuning, NO low quality, NO flat drop, NO slow tempo.",
            lyrics: `[Intro - Soft Female Vocals]
(Bouncy rhythm, African log drum softly fading in)
Nói nghe nè...
Anh có chắc là bên em suốt đời không?

[Verse 1 - Melodic Rap Male]
128 nhịp đập hòa vào tiếng đàn đêm nay
Anh không quen vẽ tương lai bằng những lời đầu môi có cánh
Nhưng nếu thế giới ngoài kia làm em thấy chênh vênh lạnh lẽo
Cứ bước về phía anh, vòng tay này chẳng hề buông lơi.

[Verse 1 - Playful Rap Female]
Em đâu cần những lời hoa mỹ xa xôi
Chỉ cần anh giữ đúng những điều anh nói
Phố thị xô bồ, người đến rồi lại đi
Nếu anh là bến đỗ, em chẳng tiếc thanh xuân trao người.

[Pre-Chorus - Duet]
Từng ánh mắt chạm nhau giữa phố đêm lung linh
Nhịp Jersey rộn vang khơi bừng lên ánh sáng
Đừng ngập ngừng nữa, hãy giữ chặt tay nhau...

[Chorus - Energetic Hook Duet]
Ta cùng khiêu vũ dưới bầu trời đầy sao
Bao âu lo gửi vào làn gió cao
Nhịp bass dập dồn, tim hòa chung một điệu
Yêu là chân thành, không toan tính chi li!

[Drop]
(Jersey bounce rhythm - Funky bass - 808 glide drops)

[Verse 2 - Melodic Rap Male & Female ad-libs]
Đường đời vạn lối, ta tìm thấy nhau giữa muôn ngàn trắc trở
Không phải tình cờ, mà là duyên nợ đã định từ lâu
Em là giai điệu ngọt ngào nhất trong bản phối đời anh
Mỗi sớm mai thức dậy có em là bình yên trọn vẹn.

[Bridge - Soft Melodic Harmony]
Dù mai này bão giông hay nắng tắt
Dù tháng năm có phủ bụi thời gian
Lời hẹn ước chân thành hôm nay
Sẽ cùng ta đi đến cuối con đường...

[Chorus - Duet Climax]
Ta cùng khiêu vũ dưới bầu trời đầy sao
Bao âu lo gửi vào làn gió cao
Nhịp bass dập dồn, tim hòa chung một điệu
Yêu là chân thành, không toan tính chi li!

[Drop - Outro]
(Bouncy Jersey triplets, ad-libs, fade out)
Mãi bên nhau nhé anh...
Ừ, mãi bên nhau em!`
        },
        2: {
            id: 2,
            name: "Vietnamese Vinahouse x Big Room EDM",
            bpm: 140,
            title: "Riêng Tình Anh Chẳng Đổi Thay",
            style: "Vietnamese Vinahouse x Big Room EDM x Electro House, 140 BPM, peak-time festival. Warm mature slightly husky male vocal, deep, sincere, emotional and powerful. START WITH VOCAL HOOK, NO LONG INTRO. Main hook: “Ngoài kia mọi thứ đổi thay, riêng tình anh chẳng đổi thay.” First explosive drop around 0:16. Theme: unwavering love despite time, distance, hardship and changes in life. Emotional piano, warm pads, cinematic strings, intimate verses, huge build-ups. Hard punchy kick, massive rolling bass, deep sub bass, aggressive supersaw, bright catchy synth lead, fast percussion, vocal chops and explosive drops. 3 drops, each harder than previous. Final drop emotional, euphoric and memorable. Wide stereo, massive bass, clean loud professional master. NO female vocal, NO duet, NO ballad, NO slow, NO acoustic, NO chill, NO weak drop.",
            lyrics: `[Intro - Vocal Hook]
Ngoài kia mọi thứ đổi thay
Riêng tình anh... chẳng đổi thay!

[Drop]
(Bass rolling, supersaw lead, explosive punch)

[Verse 1]
Thành phố lên đèn giấu những vết thương chưa lành
Dòng người vội vã lướt qua như cơn gió lạnh
Bao lời hứa hẹn theo thời gian cũng phai tàn
Chỉ có bóng hình em mãi vẹn nguyên trong anh.

[Pre-Chorus]
Dù đường đời chông chênh ngàn bão tố
Dù cách xa hay thử thách muôn trùng
Một nhịp đập nơi lồng ngực này
Vẫn chỉ gọi tên một người duy nhất...

[Chorus]
Ngoài kia mọi thứ đổi thay, riêng tình anh chẳng đổi thay!
Dù cho năm tháng có trôi, bạc trắng cả mái đầu này.
Bao nhiêu giông bão cuộc đời anh xin nhận lấy
Chỉ mong nụ cười em vẫn vẹn nguyên từng ngày!

[Drop]
(Explosive Vinahouse Drop - Massive bass rolling - Vocal chops)

[Verse 2]
Có những đêm dài lặng nhìn mưa rơi bên thềm
Tự hỏi duyên trời sao nỡ thử thách đôi tim
Nhưng nếu yêu thương là ngọn lửa trong tim
Thì bão giông nào dập tắt được niềm tin?

[Chorus]
Ngoài kia mọi thứ đổi thay, riêng tình anh chẳng đổi thay!
Dù cho năm tháng có trôi, bạc trắng cả mái đầu này.
Bao nhiêu giông bão cuộc đời anh xin nhận lấy
Chỉ mong nụ cười em vẫn vẹn nguyên từng ngày!

[Bridge]
Thời gian có thể xóa nhòa vạn vật
Vật đổi sao dời, biển hóa nương dâu
Nhưng khắc ghi một chữ TÌNH trong dạ
Thì ngàn kiếp sau vẫn chẳng thể phai màu!

[Drop - Final Climax]
(Maximum Energy Peak Drop - Euphoric Synths & Heavy Bass)

[Outro]
Ngoài kia dẫu đổi thay...
Tình anh... vẫn vẹn nguyên.
[Fade Out]`
        },
        3: {
            id: 3,
            name: "Emotional Pop Ballad x Cinematic Orchestral",
            bpm: 82,
            title: "Nếu Có Kiếp Sau",
            style: "Vietnamese Emotional Pop Ballad x Cinematic Orchestral x Modern R&B, 82 BPM, deep heartfelt tearjerker. Deep soulful and expressive male vocal, intimate breathing, raw heartfelt emotion, soaring passionate chest voice on emotional climax. Nostalgic grand piano chords, delicate acoustic guitar fingerpicking, lush warm cinematic string section, soaring cello leads, gentle heartbeat kick, deep subtle analog bass, orchestral crescendo build-up. Intimate storytelling verses, powerful cathartic chorus, tearful bridge with full strings, gentle fading piano outro. Theme: eternal devotion, bittersweet memories, silent sacrifice, unconditional love. Wide panoramic stereo, pristine high-end clarity, warm analog master. NO EDM, NO fast tempo, NO harsh autotune, NO dance beat, NO aggressive synth, NO female vocal, NO weak chorus.",
            lyrics: `[Intro - Piano Solo]
(Delicate upright piano with soft atmospheric string pads)

[Verse 1]
Góc quán quen giờ chỉ còn mình anh với tách cà phê nguội
Nhìn lá rơi bên thềm, tự hỏi em ở nơi xa có bình yên?
Người ta thường bảo thời gian là liều thuốc chữa lành mọi vết thương
Sao vết thương nhớ em, càng trôi đi lại càng đau nhói?

[Verse 2]
Có những nỗi buồn chẳng biết tỏ cùng ai
Chỉ biết giấu vào sâu thẳm tiếng thở dài
Cảm ơn em vì đã từng ghé qua năm tháng ấy
Cho anh biết thế nào là trọn vẹn một tình yêu...

[Pre-Chorus]
Dẫu biết duyên mỏng, phận chẳng thành đôi
Dẫu biết hai ta giờ như hai đường thẳng song song
Nhưng trái tim này chưa từng một lần hối tiếc
Vì đã yêu em bằng tất cả những gì anh có...

[Chorus]
Nếu có kiếp sau, xin được tìm thấy em sớm hơn
Để chở che em qua những ngày giông bão cuộc đời
Đừng khóc nữa em ơi, hãy cười lên và hạnh phúc
Dẫu người đi cùng em đến cuối con đường... chẳng phải là anh!

[Interlude - Soaring Cello & Violins]

[Bridge]
Mưa vẫn rơi như khóc thay cho chuyện tình lỡ dở
Từng nốt nhạc trầm buồn xé toạc màn đêm
Chúc em một đời an yên bên người mới
Phần đớn đau này, anh xin nhận hết về mình...

[Chorus - Climax Full Strings & Vocal Emotion]
Nếu có kiếp sau, xin được tìm thấy em sớm hơn
Để chở che em qua những ngày giông bão cuộc đời
Đừng khóc nữa em ơi, hãy cười lên và hạnh phúc
Dẫu người đi cùng em đến cuối con đường... chẳng phải là anh!

[Outro - Gentle Piano fading out]
Tạm biệt người anh yêu nhất...
Hẹn em ở một kiếp khác, bình yên hơn.
[Fade Out]`
        }
    };

    let currentSunoStyleId = 2; // Mặc định Thể loại 2 (Vinahouse)
    const styleCards = document.querySelectorAll('.style-card');
    const sunoInputTitle = document.getElementById('sunoInputTitle');
    const sunoTopic = document.getElementById('sunoTopic');
    const sunoHook = document.getElementById('sunoHook');
    const outSunoStyle = document.getElementById('outSunoStyle');
    const styleCharCount = document.getElementById('styleCharCount');
    const outSunoLyrics = document.getElementById('outSunoLyrics');
    const outSunoTitle = document.getElementById('outSunoTitle');
    const sunoLoader = document.getElementById('sunoLoader');
    const sunoOutputContent = document.getElementById('sunoOutputContent');
    const sunoEmptyOutput = document.getElementById('sunoEmptyOutput');
    const sunoExportActions = document.getElementById('sunoExportActions');

    // Chọn thể loại card
    styleCards.forEach(card => {
        card.addEventListener('click', () => {
            styleCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            currentSunoStyleId = parseInt(card.getAttribute('data-style'));
        });
    });

    // Chọn nhanh gợi ý tiêu đề bài hát
    document.querySelectorAll('.title-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const titleText = chip.getAttribute('data-title');
            if (sunoInputTitle && titleText) {
                sunoInputTitle.value = titleText;
            }
        });
    });

    // Chọn nhanh gợi ý chủ đề
    document.querySelectorAll('.tag-chip[data-topic]').forEach(chip => {
        chip.addEventListener('click', () => {
            const topicText = chip.getAttribute('data-topic');
            if (topicText) {
                if (sunoTopic.value.trim() === '') {
                    sunoTopic.value = topicText;
                } else {
                    sunoTopic.value += ', ' + topicText;
                }
            }
        });
    });

    // Helper: Định dạng và kiểm soát độ dài Prompt Style BẮT BUỘC 800 - 920 ký tự
    function formatSunoStylePrompt(rawPrompt, styleId) {
        if (!rawPrompt || rawPrompt.trim() === '') {
            return SUNO_PRESETS[styleId]?.style || '';
        }
        let p = rawPrompt.replace(/\s+/g, ' ').trim();
        
        // Nếu dài hơn 920 ký tự: cắt tại dấu phẩy hoặc chấm gần nhất trước 920
        if (p.length > 920) {
            let sub = p.substring(0, 918);
            let lastComma = sub.lastIndexOf(',');
            let lastDot = sub.lastIndexOf('.');
            let cut = Math.max(lastComma, lastDot);
            if (cut > 800) {
                p = sub.substring(0, cut).trim();
                if (!p.endsWith('.')) p += '.';
            } else {
                p = sub.trim() + '.';
            }
        }
        
        // Nếu ngắn hơn 800 ký tự: đệm thêm các tag sản xuất âm thanh phòng thu chất lượng cao
        const fillers = [
            ', wide panoramic stereo field',
            ', pristine high-end vocal clarity',
            ', analog console warmth',
            ', punchy dynamic transient control',
            ', studio acoustic room treatment',
            ', balanced frequency spectrum',
            ', broadcast-ready commercial master',
            ', NO clipping, NO audio distortion, NO muddy frequencies, NO robotic artifacts, NO flat dynamics'
        ];
        let idx = 0;
        while (p.length < 800 && idx < fillers.length) {
            if (p.endsWith('.')) p = p.slice(0, -1);
            p += fillers[idx];
            idx++;
        }
        if (!p.endsWith('.')) p += '.';
        
        // Kiểm tra lại cận trên
        if (p.length > 920) {
            let sub = p.substring(0, 918);
            let lastComma = sub.lastIndexOf(',');
            if (lastComma > 800) {
                p = sub.substring(0, lastComma).trim() + '.';
            }
        }
        
        return p;
    }

    // Đếm ký tự Live cho ô Style Prompt (chuẩn 800 - 920)
    function updateSunoStyleCount() {
        if (!outSunoStyle || !styleCharCount) return;
        const len = outSunoStyle.value.length;
        styleCharCount.innerText = `${len} / 920 ký tự (Chuẩn: 800 - 920)`;
        if (len >= 800 && len <= 920) {
            styleCharCount.className = 'char-count char-status valid';
        } else {
            styleCharCount.className = 'char-count char-status invalid';
        }
    }
    if (outSunoStyle) {
        outSunoStyle.addEventListener('input', updateSunoStyleCount);
    }

    // Bấm Mẫu Chuẩn Sẵn (Offline Preset)
    document.getElementById('sampleSunoBtn').addEventListener('click', () => {
        const preset = SUNO_PRESETS[currentSunoStyleId] || SUNO_PRESETS[2];
        if (sunoInputTitle) sunoInputTitle.value = preset.title;
        outSunoTitle.value = preset.title;
        outSunoStyle.value = preset.style;
        outSunoLyrics.value = preset.lyrics;
        updateSunoStyleCount();

        // Ẩn empty state và hiển thị kết quả
        if (sunoEmptyOutput) sunoEmptyOutput.style.display = 'none';
        sunoLoader.style.display = 'none';
        sunoOutputContent.style.display = 'block';
        if (sunoExportActions) sunoExportActions.style.display = 'flex';
    });

    // Tạo Lời & Prompt Suno AI (gọi Gemini)
    document.getElementById('generateSunoBtn').addEventListener('click', async () => {
        const apiKey = apiKeyInput.value.trim();
        if (!apiKey) {
            alert('Vui lòng nhập Google Gemini API Key để sử dụng tính năng AI.');
            apiKeyInput.focus();
            return;
        }
        localStorage.setItem('geminiApiKey', apiKey);

        const preset = SUNO_PRESETS[currentSunoStyleId] || SUNO_PRESETS[2];
        const inputTitle = sunoInputTitle ? sunoInputTitle.value.trim() : '';
        const topic = sunoTopic.value.trim();
        const hook = sunoHook.value.trim();

        // Ẩn trạng thái rỗng và kết quả cũ, hiện Loader
        if (sunoEmptyOutput) sunoEmptyOutput.style.display = 'none';
        sunoOutputContent.style.display = 'none';
        sunoLoader.style.display = 'block';
        if (sunoExportActions) sunoExportActions.style.display = 'none';

        const prompt = `Bạn là một nhạc sĩ sáng tác ca khúc hàng đầu Việt Nam và là chuyên gia Suno AI Prompt Engineering đỉnh cao.

THÔNG TIN ĐẦU VÀO TỪ NGƯỜI DÙNG:
${inputTitle ? `- TIÊU ĐỀ BÀI HÁT: "${inputTitle}" (YÊU CẦU QUAN TRỌNG NHẤT: BẮT BUỘC BÁM SÁT TIÊU ĐỀ NÀY LÀM LINH HỒN CỐT LÕI CỦA BÀI HÁT)` : '- TIÊU ĐỀ BÀI HÁT: Tự đặt tên bài hát thật sâu sắc, cuốn hút và đúng tâm trạng'}
- Thể loại âm nhạc: ${preset.name} (${preset.bpm} BPM).
- Chủ đề & Cảm xúc: ${topic || (inputTitle ? `Khai thác sâu sắc câu chuyện và cảm xúc xoay quanh tiêu đề "${inputTitle}"` : 'Tình yêu chân thành, bền chặt bất chấp năm tháng đổi thay')}
- Điểm nhấn / Câu Hook: ${hook || (inputTitle ? `Lồng ghép từ khóa tiêu đề "${inputTitle}" vào câu hook hoặc điệp khúc` : (currentSunoStyleId === 2 ? 'Ngoài kia mọi thứ đổi thay, riêng tình anh chẳng đổi thay.' : ''))}

YÊU CẦU NHIỆM VỤ CỐT LÕI:
1. SÁNG TÁC LỜI BÀI HÁT (Lyrics) TIẾNG VIỆT CÓ CHIỀU SÂU & BÁM SÁT TIÊU ĐỀ:
${inputTitle ? `⭐ QUY TẮC BẮT BUỘC VỀ TIÊU ĐỀ "${inputTitle}":
- Tiêu đề "${inputTitle}" chính là "linh hồn", đề tài và tư tưởng xuyên suốt của bài hát.
- Toàn bộ lời bài hát, cốt truyện, diễn biến tâm trạng từ [Verse 1], [Pre-Chorus], [Chorus], [Verse 2] đến [Bridge] PHẢI XOAY QUANH VÀ GIẢI NGHĨA SÂU SẮC CHO TIÊU ĐỀ "${inputTitle}".
- TỪ KHÓA / CỤM TỪ TIÊU ĐỀ "${inputTitle}" PHẢI ĐƯỢC XUẤT HIỆN TRỰC TIẾP, ĐẮT GIÁ TRONG ĐOẠN [Chorus] (Điệp khúc) hoặc câu [Hook] tạo điểm nhấn bùng nổ, gieo vào tâm trí người nghe giai điệu và ca từ không thể nào quên!
- Từng câu từng chữ phải ăn khớp và bám sát ngữ cảnh của tiêu đề "${inputTitle}", tuyệt đối không viết chung chung, mơ hồ hay lạc đề.` : '- Hãy tự đặt một tiêu đề thật đắt giá, và sáng tác lời bài hát xoay quanh tiêu đề đó.'}
- YÊU CẦU CA TỪ: "NÂNG CẤP LỜI NHẠC CÂU TỪ SÂU ĐÚNG TÂM TRẠNG, TUYỆT ĐỐI KHÔNG HỜI HỢT".
  + Ca từ phải thấm đẫm cảm xúc, giàu tính tự sự, triết lý nhân sinh và hình ảnh thơ ca đẹp, chạm tới trái tim người nghe.
  + Tuyệt đối không dùng ca từ sáo rỗng, hời hợt, vô nghĩa hay ghép từ vụng về.
  + Gieo vần điệu chuẩn xác (vần chân, vần lưng, vần đôi/ba), câu chữ gãy gọn, giàu nhạc tính.
  + Cấu trúc bài hát chuyên nghiệp cho Suno AI với các thẻ meta:
    [Intro]
    [Verse 1]
    [Pre-Chorus]
    [Chorus]
    ${currentSunoStyleId !== 3 ? '[Drop]' : '[Interlude]'}
    [Verse 2]
    [Chorus]
    [Bridge] (Đoạn cao trào chuyển biến cảm xúc mạnh mẽ nhất)
    ${currentSunoStyleId !== 3 ? '[Drop - Final Climax]' : '[Chorus - Climax]'}
    [Outro]

2. TẠO PROMPT STYLE (Style of Music) TIẾNG ANH CHO SUNO AI:
- ĐẶC BIỆT CHÚ Ý ĐỘ DÀI: BẮT BUỘC TỪ 800 KÝ TỰ VÀ KHÔNG QUÁ 920 KÝ TỰ (Khoảng 830 - 890 ký tự là tối ưu).
- Dựa trên phong cách kỹ thuật sau:
  ${preset.style}
- Tùy chỉnh chi tiết phong cách trên sao cho hòa quyện với chủ đề, tiêu đề (${inputTitle || 'deep emotional theme'}) và câu hook, giữ vững BPM, nhạc cụ, vocal timbre, build-up, drop, mastering và negative tags (NO ...).
- BẮT BUỘC đếm và đảm bảo chuỗi prompt style tiếng Anh có tổng độ dài ký tự nằm trong khoảng từ 800 đến 920 ký tự.

3. TÊN BÀI HÁT (Title):
${inputTitle ? `- BẮT BUỘC trả về chính xác tên bài hát do người dùng chỉ định: "${inputTitle}".` : '- Đặt tên bài hát ngắn gọn, cuốn hút, hợp tâm trạng.'}

Trả về kết quả ĐÚNG định dạng JSON sau (không kèm markdown \`\`\`json):
{
  "title": "${inputTitle ? inputTitle : 'Tên bài hát'}",
  "style": "Prompt Style tiếng Anh từ 800 đến 920 ký tự...",
  "lyrics": "Lời bài hát hoàn chỉnh với các thẻ [Intro], [Verse], [Chorus]..."
}`;

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.85 }
                })
            });

            const data = await response.json();
            if (data.error) {
                throw new Error(data.error.message);
            }

            let aiText = data.candidates[0].content.parts[0].text;
            aiText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
            const sunoData = JSON.parse(aiText);

            outSunoTitle.value = inputTitle || sunoData.title || preset.title;
            outSunoStyle.value = formatSunoStylePrompt(sunoData.style, currentSunoStyleId);
            outSunoLyrics.value = sunoData.lyrics || preset.lyrics;
            updateSunoStyleCount();

        } catch (error) {
            alert('Lỗi khi gọi AI tạo nhạc Suno: ' + error.message);
            console.error(error);
        } finally {
            sunoLoader.style.display = 'none';
            if (outSunoTitle.value || outSunoLyrics.value) {
                sunoOutputContent.style.display = 'block';
                if (sunoExportActions) sunoExportActions.style.display = 'flex';
            } else {
                if (sunoEmptyOutput) sunoEmptyOutput.style.display = 'flex';
            }
        }
    });

    // Copy cho các nút trong Suno AI (Prompt Style & Lyrics)
    document.querySelectorAll('.btn-copy-box').forEach(btn => {
        btn.addEventListener('click', async () => {
            const targetId = btn.getAttribute('data-target');
            const targetEl = document.getElementById(targetId);
            if (!targetEl || !targetEl.value.trim()) {
                alert('Chưa có nội dung để sao chép!');
                return;
            }
            try {
                await navigator.clipboard.writeText(targetEl.value.trim());
                const originalHtml = btn.innerHTML;
                btn.classList.add('copied');
                btn.innerHTML = '<i class="fas fa-check"></i> <span>Đã chép!</span>';
                setTimeout(() => {
                    btn.classList.remove('copied');
                    btn.innerHTML = originalHtml;
                }, 2000);
            } catch (err) {
                targetEl.select();
                document.execCommand('copy');
                alert('Đã sao chép nội dung thành công!');
            }
        });
    });

    // Copy toàn bộ Suno AI
    document.getElementById('copyAllSunoBtn').addEventListener('click', async () => {
        if (!outSunoTitle.value && !outSunoStyle.value && !outSunoLyrics.value) {
            alert('Chưa có nội dung kết quả Suno AI để sao chép!');
            return;
        }
        const text = `TÊN BÀI HÁT:\n${outSunoTitle.value}\n\n` +
                     `STYLE OF MUSIC (SUNO AI):\n${outSunoStyle.value}\n\n` +
                     `LYRICS (LỜI BÀI HÁT):\n${outSunoLyrics.value}`;
        try {
            await navigator.clipboard.writeText(text);
            alert('Đã copy toàn bộ kết quả Suno AI thành công!');
        } catch (err) {
            alert('Lỗi copy: ' + err);
        }
    });

    // Xuất file TXT Suno AI
    document.getElementById('exportSunoTxtBtn').addEventListener('click', () => {
        if (!outSunoTitle.value && !outSunoStyle.value && !outSunoLyrics.value) {
            alert('Chưa có nội dung kết quả Suno AI để xuất file!');
            return;
        }
        const text = `TÊN BÀI HÁT:\n${outSunoTitle.value}\n\n` +
                     `STYLE OF MUSIC (SUNO AI - ${outSunoStyle.value.length} KÝ TỰ):\n${outSunoStyle.value}\n\n` +
                     `LYRICS (LỜI BÀI HÁT):\n${outSunoLyrics.value}`;
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${outSunoTitle.value || 'Suno_Song'}_Prompt_Lyrics.txt`;
        a.click();
        URL.revokeObjectURL(url);
    });

    // Hàm reset sạch toàn bộ kết quả khi F5 hoặc tải lại trang
    function resetAllOutputs() {
        // Tab 1 (YouTube SEO)
        if (outTitle1) outTitle1.value = '';
        if (outTitle2) outTitle2.value = '';
        if (outTitle3) outTitle3.value = '';
        if (outDescription) outDescription.value = '';
        if (outTimestamps) outTimestamps.value = '';
        if (outHashtags) outHashtags.value = '';
        if (outTags) outTags.value = '';
        if (totalDurationEl) totalDurationEl.innerText = '00:00';
        updateAllTitleCounts();
        updateTagsCount();
        
        if (outputContent) outputContent.style.display = 'none';
        if (loader) loader.style.display = 'none';
        if (emptyOutput) emptyOutput.style.display = 'flex';
        if (seoExportActions) seoExportActions.style.display = 'none';

        // Tab 2 (Suno AI Studio)
        if (sunoInputTitle) sunoInputTitle.value = '';
        if (outSunoTitle) outSunoTitle.value = '';
        if (outSunoStyle) outSunoStyle.value = '';
        if (outSunoLyrics) outSunoLyrics.value = '';
        updateSunoStyleCount();
        
        if (sunoOutputContent) sunoOutputContent.style.display = 'none';
        if (sunoLoader) sunoLoader.style.display = 'none';
        if (sunoEmptyOutput) sunoEmptyOutput.style.display = 'flex';
        if (sunoExportActions) sunoExportActions.style.display = 'none';
    }

    // Luôn reset sạch kết quả khi tải trang / F5 để đảm bảo bài tạo ra luôn mới và chính xác
    resetAllOutputs();
});
