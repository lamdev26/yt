// =========================================================================
// TIỆN ÍCH TOÀN CỤC CHO API KEY (HIỆN/ẨN MẬT KHẨU & SAO CHÉP NHANH)
// =========================================================================
function toggleApiKeyVisibility(targetId, btn) {
    let input = null;
    if (typeof targetId === 'string') {
        input = document.getElementById(targetId);
    } else if (targetId && targetId.tagName === 'INPUT') {
        input = targetId;
    }
    if (!input && btn && btn.getAttribute && btn.getAttribute('data-target')) {
        input = document.getElementById(btn.getAttribute('data-target'));
    }
    if (!input) return;

    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';

    const btnEl = btn || (typeof event !== 'undefined' ? event.currentTarget : null);
    if (btnEl) {
        const icon = btnEl.querySelector('i');
        if (icon) {
            icon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
        } else {
            btnEl.innerHTML = isPassword ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
        }
        btnEl.title = isPassword ? 'Ẩn API Key' : 'Hiện API Key';
        btnEl.setAttribute('aria-label', isPassword ? 'Ẩn API Key' : 'Hiện API Key');
    }
}
window.toggleApiKeyVisibility = toggleApiKeyVisibility;

async function copyApiKeyToClipboard(targetId, btn) {
    let input = null;
    if (typeof targetId === 'string') {
        input = document.getElementById(targetId);
    } else if (targetId && targetId.tagName === 'INPUT') {
        input = targetId;
    }
    if (!input && btn && btn.getAttribute && btn.getAttribute('data-target')) {
        input = document.getElementById(btn.getAttribute('data-target'));
    }

    let val = '';
    if (input && input.value) {
        val = input.value.trim();
    } else if (targetId === 'auditApiKey') {
        val = (localStorage.getItem('auditGeminiApiKey') || '').trim();
    } else {
        val = (localStorage.getItem('geminiApiKey') || '').trim();
    }

    if (!val) {
        alert('Chưa có API Key để sao chép! Vui lòng nhập API Key.');
        if (input) input.focus();
        return;
    }

    let success = false;
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(val);
            success = true;
        } catch (e) {
            success = false;
        }
    }

    if (!success) {
        try {
            const ta = document.createElement('textarea');
            ta.value = val;
            ta.style.position = 'fixed';
            ta.style.left = '-9999px';
            ta.style.top = '0';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.focus();
            ta.select();
            success = document.execCommand('copy');
            document.body.removeChild(ta);
        } catch (e) {
            success = false;
        }
    }

    const btnEl = btn || (typeof event !== 'undefined' ? event.currentTarget : null);
    if (btnEl) {
        const originalHtml = btnEl.innerHTML;
        btnEl.classList.add('copied');
        btnEl.innerHTML = '<i class="fas fa-check"></i>';
        btnEl.title = 'Đã sao chép!';
        setTimeout(() => {
            btnEl.classList.remove('copied');
            btnEl.innerHTML = originalHtml;
            btnEl.title = 'Sao chép API Key';
        }, 2000);
    }
}
window.copyApiKeyToClipboard = copyApiKeyToClipboard;

document.addEventListener('DOMContentLoaded', () => {
    const tracklistInput = document.getElementById('tracklistInput');
    const songCount = document.getElementById('songCount');
    const outTimestamps = document.getElementById('outTimestamps');
    const totalDurationEl = document.getElementById('totalDuration');
    const outDescription = document.getElementById('outDescription');
    const outHashtags = document.getElementById('outHashtags');
    const hashtagsCount = document.getElementById('hashtagsCount');
    const outTags = document.getElementById('outTags');
    const tagsCount = document.getElementById('tagsCount');
    const outTitle1 = document.getElementById('outTitle1');
    const outTitle2 = document.getElementById('outTitle2');
    const outTitle3 = document.getElementById('outTitle3');
    const outTitle4 = document.getElementById('outTitle4');
    const outTitle5 = document.getElementById('outTitle5');
    const outTitle6 = document.getElementById('outTitle6');
    const outTitle7 = document.getElementById('outTitle7');
    const countTitle1 = document.getElementById('countTitle1');
    const countTitle2 = document.getElementById('countTitle2');
    const countTitle3 = document.getElementById('countTitle3');
    const countTitle4 = document.getElementById('countTitle4');
    const countTitle5 = document.getElementById('countTitle5');
    const countTitle6 = document.getElementById('countTitle6');
    const countTitle7 = document.getElementById('countTitle7');
    const seoChannelLink = document.getElementById('seoChannelLink');
    const loader = document.getElementById('loader');
    const outputContent = document.getElementById('outputContent');
    const emptyOutput = document.getElementById('emptyOutput');
    const seoExportActions = document.getElementById('seoExportActions');
    const apiKeyInput = document.getElementById('geminiApiKey');

    // -------------------------------------------------------------------------
    // 1. Quản lý Gemini API Key CHÍNH (Dùng cho Tab 1 YouTube SEO & Tab 2 Suno AI)
    // -------------------------------------------------------------------------
    const apiKeyStatus = document.getElementById('apiKeyStatus');

    function updateMainKeyStatus(val) {
        if (!apiKeyStatus) return;
        if (val && val.trim()) {
            apiKeyStatus.innerHTML = '<i class="fas fa-check-circle"></i> Đã cấu hình Key chính';
            apiKeyStatus.style.color = '#2ed573';
            apiKeyStatus.style.borderColor = 'rgba(46, 213, 115, 0.4)';
        } else {
            apiKeyStatus.innerHTML = '<i class="fas fa-shield-alt"></i> Tự động lưu';
            apiKeyStatus.style.color = '#ffa502';
            apiKeyStatus.style.borderColor = 'rgba(255, 165, 2, 0.3)';
        }
    }

    const savedMainKey = localStorage.getItem('geminiApiKey') || '';
    if (apiKeyInput) {
        apiKeyInput.value = savedMainKey;
        updateMainKeyStatus(savedMainKey);
        apiKeyInput.addEventListener('input', () => {
            const v = apiKeyInput.value.trim();
            localStorage.setItem('geminiApiKey', v);
            updateMainKeyStatus(v);
        });
    }

    // -------------------------------------------------------------------------
    // 2. Quản lý Gemini API Key RIÊNG BIỆT CHO TAB 3 (Thẩm Định Lời Chuyên Sâu)
    // Hoàn toàn độc lập, KHÔNG liên quan và KHÔNG đồng bộ với API Key chính
    // -------------------------------------------------------------------------
    const auditApiKeyInput = document.getElementById('auditApiKey');
    const auditKeyStatus = document.getElementById('auditKeyStatus');

    function updateAuditKeyStatus(val) {
        if (!auditKeyStatus) return;
        if (val && val.trim()) {
            auditKeyStatus.innerHTML = '<i class="fas fa-check-circle"></i> Đã có Key Tab 3';
            auditKeyStatus.style.color = '#2ed573';
            auditKeyStatus.style.borderColor = 'rgba(46, 213, 115, 0.4)';
        } else {
            auditKeyStatus.innerHTML = '<i class="fas fa-shield-alt"></i> Key riêng Tab 3';
            auditKeyStatus.style.color = '#ffa502';
            auditKeyStatus.style.borderColor = 'rgba(255, 165, 2, 0.3)';
        }
    }

    const savedAuditKey = localStorage.getItem('auditGeminiApiKey') || '';
    if (auditApiKeyInput) {
        auditApiKeyInput.value = savedAuditKey;
        updateAuditKeyStatus(savedAuditKey);
        auditApiKeyInput.addEventListener('input', () => {
            const v = auditApiKeyInput.value.trim();
            localStorage.setItem('auditGeminiApiKey', v);
            updateAuditKeyStatus(v);
        });
    }

    // Lắng nghe sự kiện click cho các nút Hiện/Ẩn và Sao chép (bảo đảm cả khi gọi inline hoặc event)
    document.querySelectorAll('.btn-toggle-pwd').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = btn.getAttribute('data-target') || (btn.id === 'btnToggleAuditKey' ? 'auditApiKey' : 'geminiApiKey');
            toggleApiKeyVisibility(targetId, btn);
        });
    });

    document.querySelectorAll('.btn-copy-key').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = btn.getAttribute('data-target') || (btn.id === 'btnCopyAuditKey' ? 'auditApiKey' : 'geminiApiKey');
            copyApiKeyToClipboard(targetId, btn);
        });
    });

    // =========================================================================
    // CHẾ ĐỘ SEO YOUTUBE: ĐĂNG LẺ 1 BÀI (SINGLE) VS PLAYLIST / NONSTOP (MULTI)
    // =========================================================================
    let currentSeoMode = 'playlist'; // 'playlist' | 'single'
    const btnModePlaylist = document.getElementById('btnModePlaylist');
    const btnModeSingle = document.getElementById('btnModeSingle');
    const seoPlaylistInputGroup = document.getElementById('seoPlaylistInputGroup');
    const seoSingleInputGroup = document.getElementById('seoSingleInputGroup');
    const singleSongTitle = document.getElementById('singleSongTitle');
    const seoChannelOrProducer = document.getElementById('seoChannelOrProducer');
    const seoMusicGenre = document.getElementById('seoMusicGenre');

    // Helper: Chuyển tên kênh sang handle slug và URL kênh YouTube
    function slugifyChannelName(name) {
        if (!name) return '';
        let str = name.trim().replace(/^@+/, '');
        str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        str = str.replace(/[đĐ]/g, 'd');
        str = str.replace(/[^a-zA-Z0-9]/g, '');
        return str;
    }

    function generateChannelLink(channelInput) {
        if (!channelInput) return '';
        const trimmed = channelInput.trim();
        if (!trimmed) return '';
        if (/^https?:\/\//i.test(trimmed)) {
            return trimmed;
        }
        if (/^(www\.)?youtube\.com\//i.test(trimmed)) {
            return `https://${trimmed.replace(/^www\./, 'www.')}`;
        }
        if (trimmed.startsWith('@')) {
            return `https://www.youtube.com/${trimmed}`;
        }
        const slug = slugifyChannelName(trimmed);
        return slug ? `https://www.youtube.com/@${slug}` : `https://www.youtube.com/@${trimmed.replace(/\s+/g, '')}`;
    }

    let channelLinkManuallyEdited = false;

    // Tự động đồng bộ link kênh vào phần Mô tả (Description) nếu đã có kết quả mô tả
    function syncChannelLinkToDescription() {
        if (!outDescription || !outDescription.value) return;
        const artist = (seoChannelOrProducer?.value || '').trim() || 'Kênh Âm Nhạc';
        const channelLink = (seoChannelLink?.value || '').trim() || generateChannelLink(artist);
        let desc = outDescription.value;

        if (desc.includes('Link đăng ký kênh:') || desc.includes('Ghé thăm kênh chính thức:')) {
            desc = desc.replace(/(👉\s*Link đăng ký kênh:\s*)[^\n]+/i, `$1${channelLink}?sub_confirmation=1`);
            desc = desc.replace(/(🌐\s*Ghé thăm kênh chính thức:\s*)[^\n]+/i, `$1${channelLink}`);
            outDescription.value = desc;
        }
    }

    function updateTitleCardBadges(mode) {
        const badge1 = document.getElementById('badgeTitle1');
        const badge2 = document.getElementById('badgeTitle2');
        const badge3 = document.getElementById('badgeTitle3');
        const badge4 = document.getElementById('badgeTitle4');
        const badge5 = document.getElementById('badgeTitle5');
        const badge6 = document.getElementById('badgeTitle6');
        const badge7 = document.getElementById('badgeTitle7');
        const hintEl = document.getElementById('seoTitleHint');

        if (mode === 'single') {
            if (badge1) badge1.innerHTML = '<i class="fas fa-star"></i> Tiêu đề 1: Chuẩn SEO + Đề Xuất (Khuyên dùng)';
            if (badge2) badge2.innerHTML = '<i class="fas fa-check-circle"></i> Tiêu đề 2: Thương Hiệu / Kênh Official';
            if (badge3) badge3.innerHTML = '<i class="fas fa-bolt"></i> Tiêu đề 3: TikTok Hot Trend & Bass Boosted';
            if (badge4) badge4.innerHTML = '<i class="fas fa-fire"></i> Tiêu đề 4: Kích Thích Tò Mò & Quẩy Cực Sung';
            if (badge5) badge5.innerHTML = '<i class="fas fa-search"></i> Tiêu đề 5: Tối Ưu Tìm Kiếm YouTube Search';
            if (badge6) badge6.innerHTML = '<i class="fas fa-layer-group"></i> Tiêu đề 6: LK (Liên Khúc Single Hot Trend)';
            if (badge7) badge7.innerHTML = '<i class="fas fa-trophy"></i> Tiêu đề 7: BXH (Bảng Xếp Hạng Bùng Nổ)';
            if (hintEl) hintEl.innerText = 'Công thức: [Từ khóa chính] ➔ [Trend/Hút click] ➔ [Tên kênh/Producer] • Độ dài vàng 60-70 ký tự';
            if (outTitle1) outTitle1.placeholder = 'Lỡ Yêu Em Mất Rồi (Vinahouse Remix) | Nhạc EDM TikTok Hot Trend 2026 - DJ ABC';
            if (outTitle2) outTitle2.placeholder = 'Lỡ Yêu Em Mất Rồi - Vinahouse Remix (Official Audio) | Nhạc Trẻ Hot Trend 2026 - DJ ABC';
            if (outTitle3) outTitle3.placeholder = 'Lỡ Yêu Em Mất Rồi (Vinahouse Remix) | TikTok Remix Hot Trend Bass Boosted 2026 - DJ ABC';
            if (outTitle4) outTitle4.placeholder = 'Lỡ Yêu Em Mất Rồi (Remix) | Bản Phối Bass Cực Căng Đốn Tim Gây Nghiện 2026 - DJ ABC';
            if (outTitle5) outTitle5.placeholder = 'Lỡ Yêu Em Mất Rồi Vinahouse 2026 | Nhạc Trẻ Remix Mới Nhất Quẩy Cực Sung - DJ ABC';
            if (outTitle6) outTitle6.placeholder = 'LK Lỡ Yêu Em Mất Rồi (Vinahouse Remix) | Tuyển Tập Nhạc Trẻ Triệu View Gây Nghiện 2026 - DJ ABC';
            if (outTitle7) outTitle7.placeholder = 'BXH Lỡ Yêu Em Mất Rồi (Vinahouse Remix) | Top Nhạc Remix Thịnh Hành TikTok Quẩy Cực Căng 2026 - DJ ABC';
        } else {
            if (badge1) badge1.innerHTML = '<i class="fas fa-compact-disc"></i> Tiêu đề 1: Nonstop / DJ Set (Quẩy Continuous)';
            if (badge2) badge2.innerHTML = '<i class="fas fa-crown"></i> Tiêu đề 2: Top BXH Playlist (CTR Cao Nhất)';
            if (badge3) badge3.innerHTML = '<i class="fas fa-heart"></i> Tiêu đề 3: Playlist Theo Chủ Đề & Tâm Trạng';
            if (badge4) badge4.innerHTML = '<i class="fas fa-fire"></i> Tiêu đề 4: Tuyển Tập Triệu View TikTok';
            if (badge5) badge5.innerHTML = '<i class="fas fa-bolt"></i> Tiêu đề 5: Nonstop Quẩy Club Bùng Nổ';
            if (badge6) badge6.innerHTML = '<i class="fas fa-layer-group"></i> Tiêu đề 6: LK (Liên Khúc Tuyển Chọn Hay Nhất)';
            if (badge7) badge7.innerHTML = '<i class="fas fa-trophy"></i> Tiêu đề 7: BXH (Bảng Xếp Hạng Bùng Nổ Thịnh Hành)';
            if (hintEl) hintEl.innerText = 'Công thức: [Từ khóa chính] ➔ [Trend/Hút click] ➔ [Tên kênh/Producer] • Độ dài vàng 60-70 ký tự';
            if (outTitle1) outTitle1.placeholder = 'Nonstop Vinahouse 2026 - Lỡ Yêu Em Mất Rồi x Yêu Đi Đừng Sợ | Nhạc Bãi Bay Bass Cực Căng - Remix Channel';
            if (outTitle2) outTitle2.placeholder = 'Top 15 Bài Vinahouse Hay Nhất 2026 - Lỡ Yêu Em Mất Rồi, Thương Em Nhất | Nhạc Trẻ Remix Quẩy Cực Sung - Remix Channel';
            if (outTitle3) outTitle3.placeholder = 'Playlist Vinahouse Tình Yêu Hay Nhất 2026 - Lỡ Yêu Em Mất Rồi x Say Ánh Nhìn | Nhạc Gây Nghiện Đốn Tim - Remix Channel';
            if (outTitle4) outTitle4.placeholder = 'Tuyển Tập Vinahouse TikTok Hot Trend 2026 - Lỡ Yêu Em Mất Rồi | Nhạc Quẩy Cực Căng Bùng Nổ - Remix Channel';
            if (outTitle5) outTitle5.placeholder = 'Nonstop Vinahouse Club 2026 - Lỡ Yêu Em Mất Rồi x Đêm Nay Ta Say | Tuyển Tập Nhạc Club Quẩy Nát Sàn - Remix Channel';
            if (outTitle6) outTitle6.placeholder = 'LK Vinahouse Hay Nhất 2026 - Lỡ Yêu Em Mất Rồi, Yêu Đi Đừng Sợ | Liên Khúc Nhạc Trẻ Remix Triệu View - Remix Channel';
            if (outTitle7) outTitle7.placeholder = 'BXH Bảng Xếp Hạng Vinahouse 2026 - Lỡ Yêu Em Mất Rồi, Thương Em Nhất | Top Nhạc Remix Thịnh Hành TikTok - Remix Channel';
        }
    }

    function setSeoMode(mode) {
        currentSeoMode = mode;
        if (mode === 'single') {
            btnModeSingle?.classList.add('active');
            btnModePlaylist?.classList.remove('active');
            if (seoSingleInputGroup) seoSingleInputGroup.style.display = 'block';
            if (seoPlaylistInputGroup) seoPlaylistInputGroup.style.display = 'none';
            if (singleSongTitle && !singleSongTitle.value.trim() && tracklistInput.value.trim()) {
                const firstLine = tracklistInput.value.split('\n')[0];
                const cleanTitle = firstLine.replace(/(?:(\d{1,2}):)?(\d{1,2}):(\d{1,2})/, '').replace(/^[-|:\s]+|[-|:\s]+$/g, '').trim();
                singleSongTitle.value = cleanTitle;
            }
        } else {
            btnModePlaylist?.classList.add('active');
            btnModeSingle?.classList.remove('active');
            if (seoPlaylistInputGroup) seoPlaylistInputGroup.style.display = 'block';
            if (seoSingleInputGroup) seoSingleInputGroup.style.display = 'none';
        }
        updateTitleCardBadges(mode);
    }

    if (btnModePlaylist) btnModePlaylist.addEventListener('click', () => setSeoMode('playlist'));
    if (btnModeSingle) btnModeSingle.addEventListener('click', () => setSeoMode('single'));

    // Gõ tên bài hát ở chế độ Single Track tự động đồng bộ sang tracklist
    if (singleSongTitle) {
        singleSongTitle.addEventListener('input', () => {
            const val = singleSongTitle.value.trim();
            if (val) {
                tracklistInput.value = `${val} - 03:45`;
                songCount.innerText = '1 bài';
            }
        });
    }

    // Cập nhật số lượng bài hát realtime và tự nhận diện chế độ
    tracklistInput.addEventListener('input', () => {
        const lines = tracklistInput.value.split('\n').filter(line => line.trim() !== '');
        songCount.innerText = `${lines.length} bài`;
        if (lines.length === 1 && singleSongTitle && !singleSongTitle.value.trim()) {
            const cleanTitle = lines[0].replace(/(?:(\d{1,2}):)?(\d{1,2}):(\d{1,2})/, '').replace(/^[-|:\s]+|[-|:\s]+$/g, '').trim();
            singleSongTitle.value = cleanTitle;
        }
    });

    // Chip từ khóa trend / Hậu tố hút click
    document.querySelectorAll('.seo-trend-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const trend = chip.getAttribute('data-trend');
            if (trend && seoMusicGenre) {
                if (!seoMusicGenre.value.trim()) {
                    seoMusicGenre.value = trend;
                } else if (!seoMusicGenre.value.includes(trend)) {
                    seoMusicGenre.value += ' | ' + trend;
                }
            }
        });
    });

    // Tự động nối link kênh YouTube khi người dùng nhập tên kênh hoặc dán link kênh
    if (seoChannelLink) {
        seoChannelLink.addEventListener('input', () => {
            channelLinkManuallyEdited = true;
            const linkVal = seoChannelLink.value.trim();
            if (linkVal && (!seoChannelOrProducer.value || !seoChannelOrProducer.value.trim())) {
                const handleMatch = linkVal.match(/@([a-zA-Z0-9_\-\.]+)/);
                if (handleMatch) {
                    seoChannelOrProducer.value = handleMatch[1];
                }
            }
            syncChannelLinkToDescription();
        });
    }

    if (seoChannelOrProducer) {
        seoChannelOrProducer.addEventListener('input', () => {
            const nameVal = seoChannelOrProducer.value.trim();
            // Nếu người dùng dán nguyên link URL vào ô tên kênh
            if (/^https?:\/\//i.test(nameVal) || /^(www\.)?youtube\.com\//i.test(nameVal)) {
                const link = /^https?:\/\//i.test(nameVal) ? nameVal : `https://${nameVal}`;
                if (seoChannelLink) seoChannelLink.value = link;
                const handleMatch = nameVal.match(/@([a-zA-Z0-9_\-\.]+)/);
                if (handleMatch) {
                    seoChannelOrProducer.value = handleMatch[1];
                }
                channelLinkManuallyEdited = false;
                syncChannelLinkToDescription();
                return;
            }

            // Tự động sinh link handle YouTube (@Slug) vào ô Link Kênh
            if (seoChannelLink && (!channelLinkManuallyEdited || !seoChannelLink.value.trim())) {
                seoChannelLink.value = generateChannelLink(nameVal);
            }
            syncChannelLinkToDescription();
        });
    }

    // Helper: Cập nhật đếm ký tự cho tiêu đề chuẩn Quy Tắc Vàng (60-70 ký tự tối ưu mobile)
    function updateCharCount(inputEl, counterEl) {
        if (!inputEl || !counterEl) return;
        const len = inputEl.value.length;
        if (len === 0) {
            counterEl.innerText = '0/100 ký tự';
            counterEl.style.color = 'var(--text-muted)';
        } else if (len >= 60 && len <= 70) {
            counterEl.innerText = `${len}/100 ký tự (Độ dài vàng 60-70)`;
            counterEl.style.color = '#2ed573';
            counterEl.style.fontWeight = 'bold';
        } else if (len > 100) {
            counterEl.innerText = `${len}/100 ký tự (Vượt giới hạn)`;
            counterEl.style.color = '#ff4757';
            counterEl.style.fontWeight = 'bold';
        } else if (len >= 71 && len <= 90) {
            counterEl.innerText = `${len}/100 ký tự (Tốt)`;
            counterEl.style.color = '#70a1ff';
            counterEl.style.fontWeight = 'normal';
        } else if (len > 90 && len <= 100) {
            counterEl.innerText = `${len}/100 ký tự (Gần đầy)`;
            counterEl.style.color = '#ffa502';
            counterEl.style.fontWeight = 'normal';
        } else {
            counterEl.innerText = `${len}/100 ký tự (Hơi ngắn)`;
            counterEl.style.color = '#ffa502';
            counterEl.style.fontWeight = 'normal';
        }

        // Cập nhật dòng preview mobile (60 ký tự đầu không bị ngắt dấu ...)
        const card = inputEl.closest('.title-card');
        if (card) {
            const previewSnippet = card.querySelector('.mobile-snippet');
            if (previewSnippet) {
                previewSnippet.innerText = inputEl.value ? inputEl.value.substring(0, 60) : 'Chưa có tiêu đề...';
            }
        }
    }

    function updateAllTitleCounts() {
        updateCharCount(outTitle1, countTitle1);
        updateCharCount(outTitle2, countTitle2);
        updateCharCount(outTitle3, countTitle3);
        updateCharCount(outTitle4, countTitle4);
        updateCharCount(outTitle5, countTitle5);
        updateCharCount(outTitle6, countTitle6);
        updateCharCount(outTitle7, countTitle7);
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

    // Helper: Cập nhật đếm số lượng Hashtags
    function updateHashtagsCount() {
        if (!outHashtags || !hashtagsCount) return;
        const text = outHashtags.value.trim();
        if (!text) {
            hashtagsCount.innerText = '0 hashtags';
            hashtagsCount.style.color = 'var(--text-muted)';
            return;
        }
        const matches = text.match(/#[^\s#]+/g) || text.split(/\s+/).filter(Boolean);
        const count = matches.length;
        hashtagsCount.innerText = `${count} hashtags`;
        if (count >= 15) {
            hashtagsCount.style.color = 'var(--success-color)';
        } else {
            hashtagsCount.style.color = 'var(--text-muted)';
        }
    }

    if (outHashtags) {
        outHashtags.addEventListener('input', () => {
            updateHashtagsCount();
        });
    }

    [outTitle1, outTitle2, outTitle3, outTitle4, outTitle5, outTitle6, outTitle7].forEach((input, idx) => {
        const counter = [countTitle1, countTitle2, countTitle3, countTitle4, countTitle5, countTitle6, countTitle7][idx];
        if (input && counter) {
            input.addEventListener('input', () => {
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

    // Helper: Định dạng tiêu đề SEO YouTube tối ưu 2026 (Title Case chuẩn, ký tự phân cách |, -, [], độ dài vàng 60-70 ký tự)
    function formatSeoTitle(titleStr, fallback = '') {
        if (!titleStr) return fallback;
        let str = String(titleStr).trim();

        // 1. Loại bỏ số thứ tự "1.", "1 -", ngoặc kép, và emoji ở đầu chuỗi
        str = str.replace(/^["'\d\.\-\s]+/, '').replace(/["']+$/, '').trim();
        str = str.replace(/^[\p{Extended_Pictographic}\p{Emoji}\s\-_|:•★🔥⚡🎧🎶✨]+/u, '').trim();
        str = str.replace(/^["'\d\.\-\s]+/, '').replace(/["']+$/, '').trim();

        // 2. Chuẩn hóa khoảng trắng quanh các ký tự phân cách
        str = str.replace(/\s*\|\s*/g, ' | ');
        str = str.replace(/\s*-\s*/g, ' - ');
        str = str.replace(/\s*x\s*/gi, ' x ');
        str = str.replace(/\s+/g, ' ').trim();

        // 3. Xóa dấu hai chấm dư thừa sau các tiền tố
        str = str.replace(/^(LK|BXH|TOP|NONSTOP|REMIX|PLAYLIST)\s*:\s*/i, '$1 ');

        // 4. Cắt tỉa thông minh nếu dài quá 100 ký tự (ưu tiên cắt tại dấu phân cách | hoặc -)
        if (str.length > 100) {
            let sub = str.substring(0, 99);
            let cutPos = Math.max(sub.lastIndexOf('|'), sub.lastIndexOf('-'));
            if (cutPos > 60) {
                str = sub.substring(0, cutPos).trim();
            } else {
                str = sub.trim();
            }
        }
        return str;
    }
    const formatUppercaseTitle = formatSeoTitle; // Tương thích ngược

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

    // Helper: Định dạng và làm giàu bộ Hashtags YouTube chuẩn SEO với nhiều từ khóa hot
    function formatYouTubeHashtags(rawHashtags, songNames = []) {
        const currentYear = new Date().getFullYear();
        // 1. Các hashtag cốt lõi theo yêu cầu của người dùng
        const coreHashtags = [
            '#remix',
            '#nhactreremix',
            '#nhacremix',
            '#nhachaymoingay',
            '#nhactinhyeu',
            '#NhacTre'
        ];

        // 2. Các hashtag xu hướng âm nhạc, nhạc trẻ, quẩy, trending YouTube & TikTok
        const trendingHashtags = [
            '#TopTrending',
            '#NhacHay',
            '#BXHNhacViet',
            `#NhacTre${currentYear}`,
            `#NhacRemix${currentYear}`,
            '#Nonstop',
            '#Vinahouse',
            '#Vietmix',
            '#NhacTikTok',
            '#XuHuong',
            '#XuHuongYouTube',
            '#NhacRemixMoiNhat',
            '#NhacGayNghien',
            '#BassCucManh',
            '#LienKhucNhacTre',
            '#LienKhucRemix',
            '#EDM',
            '#NhacQuay'
        ];

        // 3. Tạo hashtag từ các bài hát trong danh sách
        const songHashtags = [];
        if (Array.isArray(songNames)) {
            songNames.forEach(song => {
                if (!song) return;
                // Xóa ký tự thừa, tạo hashtag dính liền
                const cleanName = song.replace(/[\s\-_|.,!?'"()\[\]]+/g, '');
                if (cleanName.length >= 2) {
                    songHashtags.push('#' + cleanName);
                    if (!cleanName.toLowerCase().includes('remix')) {
                        songHashtags.push('#' + cleanName + 'Remix');
                    }
                }
            });
        }

        // 4. Trích xuất hashtag từ dữ liệu đầu vào hoặc AI trả về
        let aiTags = [];
        if (rawHashtags) {
            const matches = String(rawHashtags).match(/#[^\s#,;]+/g);
            if (matches && matches.length > 0) {
                aiTags = matches;
            } else {
                aiTags = String(rawHashtags)
                    .split(/[\s,;]+/)
                    .filter(Boolean)
                    .map(w => w.startsWith('#') ? w : '#' + w.replace(/[^a-zA-Z0-9\u00C0-\u024F\u1EA0-\u1EF9]/g, ''))
                    .filter(w => w.length > 2);
            }
        }

        // Hợp nhất theo thứ tự ưu tiên: Core tags -> Song tags (tối đa 12) -> AI tags -> Trending tags
        const combined = [
            ...coreHashtags,
            ...songHashtags.slice(0, 12),
            ...aiTags,
            ...trendingHashtags
        ];

        // Khử trùng lặp (không phân biệt chữ hoa/thường)
        const seen = new Set();
        const uniqueTags = [];
        for (const tag of combined) {
            let clean = tag.trim().replace(/[,;]+$/, '');
            if (!clean.startsWith('#')) clean = '#' + clean;
            const lower = clean.toLowerCase();
            if (!seen.has(lower) && clean.length > 2) {
                seen.add(lower);
                uniqueTags.push(clean);
            }
        }

        return uniqueTags.join(' ');
    }

    // Tạo 7 tiêu đề mẫu chuẩn SEO 2026: [Từ khóa chính] ➔ [Trend/Hút click] ➔ [Tên kênh/Producer]
    function generateDefaultTitles(songNames) {
        if (!songNames || songNames.length === 0) return;
        const currentYear = new Date().getFullYear();
        const s1 = songNames[0];
        const s2 = songNames.length > 1 ? songNames[1] : '';

        const artist = (seoChannelOrProducer?.value || '').trim() || (currentSeoMode === 'single' ? 'Producer Name' : 'Remix Channel');
        const genre = (seoMusicGenre?.value || '').trim() || 'Vinahouse Remix';
        const rawGenre = genre.replace(/\s+Remix/i, '');

        if (currentSeoMode === 'single') {
            // I. Đặt Tiêu Đề SEO Khi Đăng Lẻ Từng Bài (Single Track): [Từ khóa chính] ➔ [Trend/Hút click] ➔ [Tên kênh/Producer]
            // 1. Chuẩn SEO + Đề xuất: [Tên Bài Hát (Thể loại)] | [Từ khóa trend / Cảm xúc] - [Tên kênh]
            outTitle1.value = formatSeoTitle(`${s1} (${genre}) | Nhạc EDM TikTok Hot Trend ${currentYear} - ${artist}`);
            // 2. Thương hiệu / Official Audio: [Tên Bài Hát] - [Thể loại] (Official Audio) | [Trend 2026] - [Ca sĩ/Producer]
            outTitle2.value = formatSeoTitle(`${s1} - ${rawGenre} (Official Audio) | Nhạc Trẻ Hot Trend ${currentYear} - ${artist}`);
            // 3. TikTok Hot Trend & Bass Boosted
            outTitle3.value = formatSeoTitle(`${s1} (${genre}) | TikTok Remix Hot Trend Bass Boosted ${currentYear} - ${artist}`);
            // 4. Kích thích tò mò & Quẩy cực sung
            outTitle4.value = formatSeoTitle(`${s1} (Remix) | Bản Phối Bass Cực Căng Đốn Tim Gây Nghiện ${currentYear} - ${artist}`);
            // 5. Chuẩn tìm kiếm YouTube Search
            outTitle5.value = formatSeoTitle(`${s1} ${genre} ${currentYear} | Nhạc Trẻ Remix Mới Nhất Quẩy Cực Sung - ${artist}`);
            // 6. Tiêu đề 6: LK (Liên Khúc Single Hot Trend)
            outTitle6.value = formatSeoTitle(`LK ${s1} (${genre}) | Tuyển Tập Nhạc Trẻ Triệu View Gây Nghiện ${currentYear} - ${artist}`);
            // 7. Tiêu đề 7: BXH (Bảng Xếp Hạng Bùng Nổ)
            outTitle7.value = formatSeoTitle(`BXH ${s1} (${genre}) | Top Nhạc Remix Thịnh Hành TikTok Quẩy Cực Căng ${currentYear} - ${artist}`);
        } else {
            // II. Đặt Tiêu Đề SEO Khi Đăng Playlist / Nonstop: [Từ khóa chính] ➔ [Trend/Hút click] ➔ [Tên kênh/Producer]
            const countNum = songNames.length >= 5 ? songNames.length : 15;
            // 1. Công thức Nonstop / DJ Set: Nonstop [Thể loại] 2026 - [Bài 1] x [Bài 2] | [Hút click] - [Tên kênh]
            outTitle1.value = formatSeoTitle(`Nonstop ${rawGenre} ${currentYear} - ${s1} x ${s2 || 'Yêu Đi Đừng Sợ'} | Nhạc Bãi Bay Bass Cực Căng - ${artist}`);
            // 2. Công thức Playlist / Top BXH: Top [Số lượng] [Thể loại] 2026 - [2 bài hot] | [Trend] - [Tên kênh]
            outTitle2.value = formatSeoTitle(`Top ${countNum} Bài ${rawGenre} Hay Nhất ${currentYear} - ${s1}, ${s2 || 'Thương Em Nhất'} | Nhạc Trẻ Remix Quẩy Cực Sung - ${artist}`);
            // 3. Playlist Theo Chủ Đề: Playlist [Thể loại] [Chủ đề] 2026 - [Bài 1] x [Bài 2] | [Gây nghiện] - [Tên kênh]
            outTitle3.value = formatSeoTitle(`Playlist ${rawGenre} Tình Yêu Hay Nhất ${currentYear} - ${s1} x ${s2 || 'Say Ánh Nhìn'} | Nhạc Gây Nghiện Đốn Tim - ${artist}`);
            // 4. Tuyển Tập Triệu View TikTok: Tuyển Tập [Thể loại] TikTok Hot Trend 2026 - [Tên bài] | [Hút click] - [Tên kênh]
            outTitle4.value = formatSeoTitle(`Tuyển Tập ${rawGenre} TikTok Hot Trend ${currentYear} - ${s1} | Nhạc Quẩy Cực Căng Bùng Nổ - ${artist}`);
            // 5. Nonstop Club Quẩy Nát Sàn: Nonstop [Thể loại] Club 2026 - [Bài 1] x [Bài 2] | [Club nát sàn] - [Tên kênh]
            outTitle5.value = formatSeoTitle(`Nonstop ${rawGenre} Club ${currentYear} - ${s1} x ${s2 || 'Đêm Nay Ta Say'} | Tuyển Tập Nhạc Club Quẩy Nát Sàn - ${artist}`);
            // 6. Tiêu đề 6: LK (Liên Khúc Tuyển Chọn Hay Nhất)
            outTitle6.value = formatSeoTitle(`LK ${rawGenre} Hay Nhất ${currentYear} - ${s1}, ${s2 || 'Yêu Đi Đừng Sợ'} | Liên Khúc Nhạc Trẻ Remix Triệu View - ${artist}`);
            // 7. Tiêu đề 7: BXH (Bảng Xếp Hạng Bùng Nổ Thịnh Hành)
            outTitle7.value = formatSeoTitle(`BXH Bảng Xếp Hạng ${rawGenre} ${currentYear} - ${s1}, ${s2 || 'Thương Em Nhất'} | Top Nhạc Remix Thịnh Hành TikTok - ${artist}`);
        }
        updateAllTitleCounts();
    }

    // Tạo mô tả mẫu tự động nối link kênh YouTube
    function generateDefaultDescription(songNames) {
        if (!songNames || songNames.length === 0) return '';
        const s1 = songNames[0];
        const otherSongs = songNames.slice(1, 4).join(', ');
        const currentYear = new Date().getFullYear();
        const artist = (seoChannelOrProducer?.value || '').trim() || (currentSeoMode === 'single' ? 'Producer Name' : 'Kênh Âm Nhạc');
        const channelLink = (seoChannelLink?.value || '').trim() || generateChannelLink(artist);
        const genre = (seoMusicGenre?.value || '').trim() || 'Nhạc Trẻ Remix Hot Trend';

        if (currentSeoMode === 'single') {
            return `🎧 ${s1} (${genre}) - Sản phẩm âm nhạc được phối khí cuốn hút với nhịp bass uy lực, giai điệu bắt tai và ca từ chạm sâu cảm xúc người nghe.\n\n` +
                   `🔥 Hãy tăng âm lượng, đeo tai nghe hoặc thưởng thức trên dàn loa chất lượng cao để cảm nhận trọn vẹn từng dải âm thanh bùng nổ.\n\n` +
                   `❤️ Nếu bạn yêu thích bản nhạc này, đừng quên bấm Like 👍 • Chia sẻ 📤 • Đăng ký kênh 🔔 ${artist} để không bỏ lỡ những siêu phẩm âm nhạc mới nhất!\n` +
                   `👉 Link đăng ký kênh: ${channelLink}?sub_confirmation=1\n` +
                   `🌐 Ghé thăm kênh chính thức: ${channelLink}\n\n` +
                   `🎼 Ca khúc: ${s1}\n` +
                   `🎧 Thể loại: ${genre}\n` +
                   `✨ Kênh phát hành: ${artist}\n` +
                   `🌟 Bản quyền âm thanh và hình ảnh thuộc về tác giả & kênh sản xuất.`;
        }

        return `🎧 Nonstop ${genre} ${currentYear} - Tuyển tập những ca khúc nhạc trẻ remix hot nhất (${s1}${otherSongs ? ', ' + otherSongs : ''}) với giai điệu cực sung, bass căng đốn tim, lý tưởng để nghe khi lái xe, tập gym, làm việc hay quẩy tiệc cùng bạn bè.\n\n` +
               `🔥 Tăng âm lượng, đeo tai nghe hoặc mở trên hệ thống loa chất lượng để cảm nhận trọn vẹn từng nhịp bass và giai điệu đầy mê hoặc.\n\n` +
               `❤️ Nếu bạn yêu thích video này, đừng quên Like 👍 • Chia sẻ 📤 • Đăng ký 🔔 kênh ${artist} để luôn cập nhật những bản nhạc, playlist và video âm nhạc mới nhất.\n` +
               `👉 Link đăng ký kênh: ${channelLink}?sub_confirmation=1\n` +
               `🌐 Ghé thăm kênh chính thức: ${channelLink}\n\n` +
               `🎼 Thể loại: ${genre} ${currentYear}\n` +
               `🎶 Phong cách: Nonstop DJ Set / Playlist Tuyển Tập Hot Trend\n` +
               `🎧 Trải nghiệm tốt nhất: Nghe bằng tai nghe hoặc loa chất lượng để tận hưởng âm thanh sống động.\n\n` +
               `✨ Chúc các bạn có những giây phút thư giãn tuyệt vời cùng âm nhạc!`;
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

    // Logic tính toán Timestamps (Hỗ trợ cả Bài Đơn Lẻ & Playlist)
    function processTimestamps() {
        // Nếu ở chế độ Đăng Lẻ 1 Bài (Single Track)
        if (currentSeoMode === 'single') {
            const singleTitle = (singleSongTitle?.value || '').trim() || (tracklistInput.value.split('\n')[0] || '').replace(/(?:(\d{1,2}):)?(\d{1,2}):(\d{1,2})/, '').replace(/^[-|:\s]+|[-|:\s]+$/g, '').trim();
            if (singleTitle) {
                outTimestamps.value = `00:00 ${singleTitle}`;
                if (totalDurationEl) totalDurationEl.innerText = '03:45';
                return [singleTitle];
            }
        }

        const lines = tracklistInput.value.split('\n');
        let currentSeconds = 0;
        let result = [];
        let songNames = [];

        const timeRegex = /(?:(\d{1,2}):)?(\d{1,2}):(\d{1,2})/;

        lines.forEach(line => {
            if (!line.trim()) return;
            const match = line.match(timeRegex);
            if (match) {
                const hours = match[1] ? parseInt(match[1]) : 0;
                const minutes = parseInt(match[2]);
                const seconds = parseInt(match[3]);
                const durationInSeconds = (hours * 3600) + (minutes * 60) + seconds;

                let title = line.replace(match[0], '').replace(/^[-|:\s]+|[-|:\s]+$/g, '').trim();
                if (!title) title = `Bài Hát ${songNames.length + 1}`;
                result.push(`${formatTime(currentSeconds)} ${title}`);
                songNames.push(title);
                currentSeconds += durationInSeconds;
            } else {
                let title = line.replace(/^[\d\.\-\s]+/, '').replace(/^[-|:\s]+|[-|:\s]+$/g, '').trim();
                if (title) {
                    result.push(`${formatTime(currentSeconds)} ${title}`);
                    songNames.push(title);
                    currentSeconds += 210; // Giả định 03:30 nếu không có timestamp
                }
            }
        });

        if (songNames.length === 0) return null;

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
        outHashtags.value = formatYouTubeHashtags('', songs);
        updateHashtagsCount();
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
        const secondSong = songs.length > 1 ? songs[1] : '';
        const highlightSongs = songs.slice(0, 5).join(', ');

        const isSingleTrack = currentSeoMode === 'single';
        const artist = (seoChannelOrProducer?.value || '').trim() || (isSingleTrack ? 'Producer Name' : 'Remix Channel');
        const channelLink = (seoChannelLink?.value || '').trim() || generateChannelLink(artist);
        const genre = (seoMusicGenre?.value || '').trim() || 'Vinahouse Remix';
        const rawGenre = genre.replace(/\s+Remix/i, '');

        const prompt = `Bạn là một CHUYÊN GIA SÁNG TẠO NỘI DUNG ÂM NHẠC & BẬC THẦY SEO YOUTUBE HÀNG ĐẦU NĂM ${currentYear}.

THÔNG TIN ĐẦU VÀO TỪ NGƯỜI DÙNG:
- Chế độ đăng bài: ${isSingleTrack ? 'ĐĂNG LẺ TỪNG BÀI (Single Track)' : 'ĐĂNG PLAYLIST / NONSTOP / TỔNG HỢP (Multi Track)'}
- Danh sách bài hát: ${songs.join(', ')}
- Bài hát chính (hot nhất): "${firstSong}"
${secondSong ? `- Bài hát thứ hai: "${secondSong}"` : ''}
- Tên Kênh / Ca sĩ / Producer: "${artist}"
- Link Kênh YouTube: "${channelLink}"
- Thể loại âm nhạc: "${genre}"

========================================================================
YÊU CẦU ĐẶC BIỆT: TẠO ĐÚNG 7 TIÊU ĐỀ SEO YOUTUBE CHUẨN THUẬT TOÁN ${currentYear}
========================================================================

⭐ BẮT BUỘC TUÂN THỦ NGHIÊM NGẶT "CÔNG THỨC VÀNG THỨ TỰ TỪ KHÓA TỪ TRÁI SANG PHẢI":
   [Từ khóa tìm kiếm chính] ➔ [Trend / Hút click] ➔ [Tên kênh / Producer]
   (Tên kênh / Producer luôn đặt ở cuối cùng sau dấu gạch ngang (-) hoặc dấu (|)).

1. ĐỘ DÀI LÝ TƯỞNG: TỪ 60 ĐẾN 70 KÝ TỰ (Tối đa 100 ký tự). Đoạn 60 ký tự đầu tiên sẽ hiển thị trọn vẹn trên màn hình điện thoại di động mà không bị ngắt dấu ba chấm (...).
2. KÝ TỰ PHÂN CÁCH CHUẨN MỰC: Dùng dấu gạch đứng (|), dấu gạch ngang (-), hoặc ngoặc tròn (()) để tách các phần rõ ràng: [Từ khóa chính] | [Trend/Hút click] - [Tên kênh].
3. TRÁNH SPAM TỪ KHÓA: Không lặp lại 1 từ quá 3 lần trong tiêu đề.
4. VIẾT HOA ĐẸP MẮT (Title Case): Viết hoa chữ cái đầu các từ chính, giữ nguyên chữ viết hoa các từ viết tắt chuyên ngành (EDM, DJ, TikTok, Remix, Nonstop, Top, BXH, LK, VIP, Official Audio...). Tuyệt đối không để icon/emoji ở đầu tiêu đề.

${isSingleTrack ? `
CÔNG THỨC 7 TIÊU ĐỀ CHO BÀI ĐƠN LẺ (SINGLE TRACK):
Mục tiêu: Đạt top tìm kiếm theo tên bài hát, thể loại và từ khóa hot trend trên TikTok/YouTube.
- title1 (Chuẩn SEO + Đề xuất - Khuyên dùng):
  Cấu trúc: [Tên Bài Hát] ([Thể Loại Remix]) | [Từ Khóa Trend / Cảm Xúc] - [Tên Kênh]
  Ví dụ: ${firstSong} (${genre}) | Nhạc EDM TikTok Hot Trend ${currentYear} - ${artist}
- title2 (Thương hiệu / Official):
  Cấu trúc: [Tên Bài Hát] - [Thể Loại] (Official Audio) | [Cụm Từ Trend 2026] - [Ca Sĩ / Producer]
  Ví dụ: ${firstSong} - ${rawGenre} (Official Audio) | Nhạc Trẻ Hot Trend ${currentYear} - ${artist}
- title3 (TikTok Hot Trend & Bass Boosted):
  Cấu trúc: [Tên Bài Hát] ([Thể Loại Remix]) | TikTok Remix Hot Trend Bass Boosted ${currentYear} - [Tên Kênh]
  Ví dụ: ${firstSong} (${genre}) | TikTok Remix Hot Trend Bass Boosted ${currentYear} - ${artist}
- title4 (Kích thích tò mò & Quẩy cực sung):
  Cấu trúc: [Tên Bài Hát] (Remix) | Bản Phối Bass Cực Căng Đốn Tim Gây Nghiện ${currentYear} - [Tên Kênh]
- title5 (Chuẩn tìm kiếm YouTube Search):
  Cấu trúc: [Tên Bài Hát] ${genre} ${currentYear} | Nhạc Trẻ Remix Mới Nhất Quẩy Cực Sung - [Tên Kênh]
- title6 (Tiêu đề 6: LK - Liên Khúc Single Hot Trend):
  Cấu trúc: LK [Tên Bài Hát] ([Thể Loại Remix]) | Tuyển Tập Nhạc Trẻ Triệu View Gây Nghiện ${currentYear} - [Tên Kênh]
  Ví dụ: LK ${firstSong} (${genre}) | Tuyển Tập Nhạc Trẻ Triệu View Gây Nghiện ${currentYear} - ${artist}
- title7 (Tiêu đề 7: BXH - Bảng Xếp Hạng Bùng Nổ):
  Cấu trúc: BXH [Tên Bài Hát] ([Thể Loại Remix]) | Top Nhạc Remix Thịnh Hành TikTok Quẩy Cực Căng ${currentYear} - [Tên Kênh]
  Ví dụ: BXH ${firstSong} (${genre}) | Top Nhạc Remix Thịnh Hành TikTok Quẩy Cực Căng ${currentYear} - ${artist}
` : `
CÔNG THỨC 7 TIÊU ĐỀ CHO PLAYLIST / NONSTOP / TỔNG HỢP:
Mục tiêu: Kéo dài thời gian xem (Watch time) và tăng tối đa CTR.
- title1 (Nonstop / DJ Set - Quẩy Continuous):
  Cấu trúc: Nonstop [Thể Loại] ${currentYear} - [Tên Bài Hot 1] x [Tên Bài Hot 2] | [Chủ Đề / Cụm Từ Hút Click] - [Tên Kênh]
  Ví dụ: Nonstop ${rawGenre} ${currentYear} - ${firstSong} x ${secondSong || 'Yêu Đi Đừng Sợ'} | Nhạc Bãi Bay Bass Cực Căng - ${artist}
- title2 (Top BXH Playlist - CTR cao nhất):
  Cấu trúc: Top [Số Lượng] Bài Hát [Thể Loại] Hay Nhất ${currentYear} - [Tên 2-3 Bài Hot] | [Trend/Hút click] - [Tên Kênh]
  Ví dụ: Top ${songs.length >= 5 ? songs.length : 15} Bài ${rawGenre} Hay Nhất ${currentYear} - ${firstSong}, ${secondSong || 'Thương Em Nhất'} | Nhạc Trẻ Remix Quẩy Cực Sung - ${artist}
- title3 (Playlist Theo Chủ Đề & Cảm Xúc):
  Cấu trúc: Playlist [Thể Loại] [Chủ Đề] Hay Nhất ${currentYear} - [Tên Bài Hot 1] x [Tên Bài Hot 2] | [Cụm Từ Hút Click] - [Tên Kênh]
  Ví dụ: Playlist ${rawGenre} Tình Yêu Hay Nhất ${currentYear} - ${firstSong} x ${secondSong || 'Say Ánh Nhìn'} | Nhạc Gây Nghiện Đốn Tim - ${artist}
- title4 (Tuyển tập Triệu View TikTok):
  Cấu trúc: Tuyển Tập [Thể Loại] TikTok Hot Trend ${currentYear} - [${firstSong}] | [Hút click] - [Tên Kênh]
- title5 (Nonstop Club / Quẩy Nát Sàn):
  Cấu trúc: Nonstop [Thể Loại] Club ${currentYear} - ${firstSong} x ${secondSong || 'Đêm Nay Ta Say'} | Tuyển Tập Nhạc Club Quẩy Nát Sàn - ${artist}
- title6 (Tiêu đề 6: LK - Liên Khúc Tuyển Chọn Hay Nhất):
  Cấu trúc: LK [Thể Loại] Hay Nhất ${currentYear} - [Tên 2-3 Bài Hot] | Liên Khúc Nhạc Trẻ Remix Triệu View - [Tên Kênh]
  Ví dụ: LK ${rawGenre} Hay Nhất ${currentYear} - ${firstSong}, ${secondSong || 'Yêu Đi Đừng Sợ'} | Liên Khúc Nhạc Trẻ Remix Triệu View - ${artist}
- title7 (Tiêu đề 7: BXH - Bảng Xếp Hạng Bùng Nổ Thịnh Hành):
  Cấu trúc: BXH Bảng Xếp Hạng [Thể Loại] ${currentYear} - [Tên 2-3 Bài Hot] | Top Nhạc Remix Thịnh Hành TikTok - [Tên Kênh]
  Ví dụ: BXH Bảng Xếp Hạng ${rawGenre} ${currentYear} - ${firstSong}, ${secondSong || 'Thương Em Nhất'} | Top Nhạc Remix Thịnh Hành TikTok - ${artist}
`}

========================================================================
2. TẠO MÔ TẢ (DESCRIPTION) BIẾN TẤU SÁNG TẠO - TỰ ĐỘNG NỐI LINK KÊNH:
========================================================================
- Dựa trên ${isSingleTrack ? `bài hát "${firstSong}" và thể loại "${genre}"` : `tuyển tập (${highlightSongs})`} để viết đoạn mô tả giàu năng lượng, cuốn hút.
- BẮT BUỘC chèn chính xác link đăng ký kênh (${channelLink}?sub_confirmation=1) và link kênh (${channelLink}) vào đoạn kêu gọi Like/Share/Subscribe.
- Thêm thông tin: Tên bài, thể loại, thông tin Producer/Kênh (${artist}), hướng dẫn nghe bằng tai nghe/dàn âm thanh chất lượng.
- Tuyệt đối không dùng dấu định dạng markdown như ** hay * trong mô tả. Chỉ dùng text thuần và emoji.

========================================================================
3. THẺ TAGS (TỐI ĐA 450 KÝ TỰ):
========================================================================
Phân cách bởi dấu phẩy, chọn lọc các từ khóa tìm kiếm cao nhất (Tên bài, ca sĩ, thể loại, hot trend). Độ dài dưới 450 ký tự.

========================================================================
4. HASHTAGS (TỐI THIỂU 20 - 30 HASHTAGS):
========================================================================
Phân cách bởi dấu cách, gồm: #remix #nhactreremix #nhacremix #nhachaymoingay #nhactinhyeu #NhacTre #${isSingleTrack ? firstSong.replace(/\s+/g, '') : 'Nonstop'} #${rawGenre.replace(/\s+/g, '')} #TopTrending #NhacHay #BXHNhacViet #Vinahouse #Vietmix #Nonstop #NhacTikTok #XuHuong #NhacRemixMoiNhat #NhacGayNghien #BassCucManh #LienKhucRemix...

Trả về kết quả ĐÚNG ĐỊNH DẠNG JSON sau (không kèm markdown \`\`\`json):
{
  "title1": "Tiêu đề 1 tuân thủ đúng công thức [Từ khóa chính] | [Trend] - [Tên kênh]",
  "title2": "Tiêu đề 2 tuân thủ đúng công thức [Từ khóa chính] | [Trend] - [Tên kênh]",
  "title3": "Tiêu đề 3 tuân thủ đúng công thức [Từ khóa chính] | [Trend] - [Tên kênh]",
  "title4": "Tiêu đề 4 tuân thủ đúng công thức [Từ khóa chính] | [Trend] - [Tên kênh]",
  "title5": "Tiêu đề 5 tuân thủ đúng công thức [Từ khóa chính] | [Trend] - [Tên kênh]",
  "title6": "LK Tiêu đề 6 Liên Khúc [Từ khóa chính] | [Trend] - [Tên kênh]",
  "title7": "BXH Tiêu đề 7 Bảng Xếp Hạng [Từ khóa chính] | [Trend] - [Tên kênh]",
  "description": "Mô tả đầy đủ có nối link kênh...",
  "hashtags": "#hashtag1 #hashtag2 ...",
  "tags": "tag1, tag2, tag3 ..."
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
            
            const seoData = JSON.parse(aiText);

            outTitle1.value = formatSeoTitle(seoData.title1 || (Array.isArray(seoData.titles) ? seoData.titles[0] : ''));
            outTitle2.value = formatSeoTitle(seoData.title2 || (Array.isArray(seoData.titles) ? seoData.titles[1] : ''));
            outTitle3.value = formatSeoTitle(seoData.title3 || (Array.isArray(seoData.titles) ? seoData.titles[2] : ''));
            outTitle4.value = formatSeoTitle(seoData.title4 || (Array.isArray(seoData.titles) ? seoData.titles[3] : ''));
            outTitle5.value = formatSeoTitle(seoData.title5 || (Array.isArray(seoData.titles) ? seoData.titles[4] : ''));
            outTitle6.value = formatSeoTitle(seoData.title6 || (Array.isArray(seoData.titles) ? seoData.titles[5] : ''));
            outTitle7.value = formatSeoTitle(seoData.title7 || (Array.isArray(seoData.titles) ? seoData.titles[6] : ''));
            updateTitleCardBadges(currentSeoMode);
            updateAllTitleCounts();

            // Cập nhật giao diện
            outDescription.value = seoData.description || '';
            outHashtags.value = formatYouTubeHashtags(seoData.hashtags || '', songs);
            updateHashtagsCount();
            outTags.value = formatYouTubeTags(seoData.tags || '');
            updateTagsCount();

        } catch (error) {
            alert('Lỗi khi gọi AI: ' + error.message);
            console.error(error);
        } finally {
            // Tắt Loader
            loader.style.display = 'none';
            if (outTitle1.value || outTitle2.value || outTitle3.value || outTitle4.value || outTitle5.value || outDescription.value) {
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
        const titles = [outTitle1.value, outTitle2.value, outTitle3.value, outTitle4.value, outTitle5.value, outTitle6.value, outTitle7.value].filter(Boolean);
        if (titles.length > 0) {
            titlesBlock = `TIÊU ĐỀ GỢI Ý:\n` +
                          titles.map((t, idx) => `${idx + 1}. ${t}`).join('\n') + `\n\n`;
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
        if (!outDescription.value && !outTimestamps.value && !outTitle1.value && !outTitle2.value && !outTitle3.value && !outTitle4.value && !outTitle5.value && !outTitle6.value && !outTitle7.value) {
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
        if (!outDescription.value && !outTimestamps.value && !outTitle1.value && !outTitle2.value && !outTitle3.value && !outTitle4.value && !outTitle5.value && !outTitle6.value && !outTitle7.value) {
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
        if (!outDescription.value && !outTimestamps.value && !outTitle1.value && !outTitle2.value && !outTitle3.value && !outTitle4.value && !outTitle5.value && !outTitle6.value && !outTitle7.value) {
            alert('Chưa có nội dung kết quả để xuất DOCX!');
            return;
        }
        const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>YouTube SEO</title></head><body>";
        const footer = "</body></html>";
        const titlesDocx = (outTitle1.value || outTitle2.value || outTitle3.value || outTitle4.value || outTitle5.value) ? `
            <h2>GỢI Ý TIÊU ĐỀ SEO YOUTUBE (CHUẨN 2026)</h2>
            ${outTitle1.value ? `<p><strong>1. Chuẩn SEO + Đề Xuất:</strong> ${outTitle1.value}</p>` : ''}
            ${outTitle2.value ? `<p><strong>2. Kênh Official:</strong> ${outTitle2.value}</p>` : ''}
            ${outTitle3.value ? `<p><strong>3. TikTok Trend & Bass Boosted:</strong> ${outTitle3.value}</p>` : ''}
            ${outTitle4.value ? `<p><strong>4. Kích Thích Tò Mò:</strong> ${outTitle4.value}</p>` : ''}
            ${outTitle5.value ? `<p><strong>5. YouTube Search:</strong> ${outTitle5.value}</p>` : ''}
            ${outTitle6.value ? `<p><strong>6. LK (Liên Khúc):</strong> ${outTitle6.value}</p>` : ''}
            ${outTitle7.value ? `<p><strong>7. BXH (Bảng Xếp Hạng):</strong> ${outTitle7.value}</p>` : ''}
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

            // Khi chuyển sang Tab Kiểm tra lời (Tab 3): tự động đồng bộ từ Tab Suno
            if (targetTab === 'tab-lyrics-audit') {
                syncSunoToAudit();
            }
        });
    });

    // ==========================================
    // SUNO AI STUDIO LOGIC & PRESETS
    // ==========================================
    const STYLE_TO_AUDIT_GENRE = {
        1: 'rap_jersey',
        2: 'vinahouse',
        3: 'ballad',
        4: 'jerk_drill',
        5: 'rumba',
        6: 'chacha',
        7: 'bolero_mientay',
        8: 'ballad_dantoc'
    };
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
Một hai tám nhịp đập hòa vào tiếng đàn đêm nay
Từng câu thề anh không vẽ bằng lời đầu môi gió bay
Nếu thế giới ngoài kia làm em chênh vênh lạnh giá
Cứ tựa vào vai anh, chẳng bao giờ buông tay rời xa!

[Verse 1 - Playful Rap Female]
Em đâu cần những lời hoa mỹ xa xôi
Chỉ cần anh giữ trọn câu hứa trên môi
Phố thị xô bồ, người vội vã chia phôi
Nếu anh là bến đỗ, em trao cả thanh xuân này rồi!

[Pre-Chorus - Duet]
Ánh mắt chạm nhau giữa phố đêm lung linh ánh đèn
Nhịp Jersey rộn vang khơi bừng lên bao khát khao ấm êm
Giữ chặt tay anh, cùng bước qua muôn trùng bão táp
Để từng nốt nhạc ru êm giấc mộng bình yên...

[Chorus - Energetic Hook Duet]
Ta cùng khiêu vũ dưới bầu trời đầy sao
Gửi muôn phiền lo bay vút lên trời cao
Nhịp bass dập dồn, tim hòa chung một điệu
Yêu là chân thành, chẳng toan tính chi li!

[Drop]
(Jersey bounce rhythm - Funky bass - 808 glide drops)

[Verse 2 - Melodic Rap Male & Female ad-libs]
Đường đời vạn lối, ta tìm thấy nhau giữa giông bão cuộc đời
Không phải tình cờ, mà là duyên nợ đã định sẵn người ơi
Em là giai điệu ngọt ngào nhất trong bản phối đời anh
Mỗi sớm mai thức dậy có em là bình yên trong lành!

[Bridge - Soft Melodic Harmony]
Dù mai này bão giông hay nắng tắt
Dù tháng năm có phủ bụi thời gian
Lời hẹn ước chân thành hôm nay
Sẽ cùng ta đi đến cuối con đường...

[Chorus - Duet Climax]
Ta cùng khiêu vũ dưới bầu trời đầy sao
Gửi muôn phiền lo bay vút lên trời cao
Nhịp bass dập dồn, tim hòa chung một điệu
Yêu là chân thành, chẳng toan tính chi li!

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
Ngoài kia dẫu vạn vật đổi thay
Riêng tình anh... vẫn đong đầy hôm nay!

[Drop]
(Bass rolling, supersaw lead, explosive punch)

[Verse 1]
Thành phố lên đèn giấu những vết thương chưa lành
Dòng người vội vã lướt qua như cơn gió lạnh
Bao lời hẹn ước theo năm tháng cũng tàn phai
Chỉ bóng hình em khắc sâu chẳng hề nhạt phai.

[Pre-Chorus]
Dù đường đời chông chênh ngàn bão tố
Dù cách xa muôn dặm nẻo phong ba
Một nhịp đập nơi lồng ngực này tha thiết
Vẫn chỉ gọi tên một người duy nhất... là em!

[Chorus]
Ngoài kia mọi thứ đổi thay, riêng tình anh chẳng đổi thay!
Dẫu cho năm tháng có trôi, bạc trắng mái đầu này.
Bao nhiêu giông bão cuộc đời anh xin nhận lấy
Chỉ mong nụ cười em vẫn rạng rỡ từng ngày!

[Drop]
(Explosive Vinahouse Drop - Massive bass rolling - Vocal chops)

[Verse 2]
Những đêm dài nghe mưa rơi rớt bên thềm
Tự hỏi duyên trời sao nỡ thử thách đôi tim
Nếu yêu thương là ngọn lửa ấm trong đêm
Thì bão giông nào dập tắt được niềm tin êm đềm?

[Bridge]
Vạn vật thế gian có thể đổi dời
Biển cạn đá mòn, vật đổi sao dời
Nhưng một chữ TÌNH đã khắc sâu trong dạ
Thì ngàn kiếp sau vẫn vẹn nguyên rạng ngời!

[Drop - Final Climax]
(Maximum Energy Peak Drop - Euphoric Synths & Heavy Bass)

[Outro]
Ngoài kia dẫu đổi thay...
Tình anh... vẫn vẹn nguyên nơi này.
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
Nhìn chiếc lá rơi bên thềm, tự hỏi em ở nơi xa có bình yên?
Người ta thường bảo thời gian là liều thuốc chữa lành mọi vết thương
Sao vết thương nhớ em, càng trôi đi lại càng đau nhức nhối?

[Verse 2]
Có những nỗi buồn chẳng biết tỏ cùng ai
Chỉ biết giấu vào sâu thẳm tiếng thở dài
Cảm ơn em vì đã từng ghé qua năm tháng ấy
Cho anh biết thế nào là trọn vẹn một tình yêu...

[Pre-Chorus]
Dẫu biết duyên mỏng, phận mình chẳng thành đôi
Dẫu hai ta giờ tựa hai đường thẳng chia phôi
Nhưng trái tim này chưa từng một lần hối tiếc
Vì đã yêu em bằng tất cả những gì anh có...

[Chorus]
Nếu có kiếp sau, xin được tìm thấy em sớm hơn
Để chở che em qua những ngày giông bão ngập tràn
Đừng khóc nữa em ơi, hãy mỉm cười và hạnh phúc
Dẫu người đi cùng em đến cuối con đường... chẳng phải là anh!

[Interlude - Soaring Cello & Violins]

[Bridge]
Mưa vẫn rơi như khóc thay cho chuyện tình lỡ dở
Từng nốt nhạc trầm buồn xé toạc màn đêm buông
Chúc em một đời an yên bên người mới
Phần đớn đau này, anh xin nhận hết về riêng mình...

[Chorus - Climax Full Strings & Vocal Emotion]
Nếu có kiếp sau, xin được tìm thấy em sớm hơn
Để chở che em qua những ngày giông bão ngập tràn
Đừng khóc nữa em ơi, hãy mỉm cười và hạnh phúc
Dẫu người đi cùng em đến cuối con đường... chẳng phải là anh!

[Outro - Gentle Piano fading out]
Tạm biệt người anh yêu nhất...
Hẹn em ở một kiếp khác, bình yên hơn.
[Fade Out]`
        },
        4: {
            id: 4,
            name: "Vietnamese Jerk Drill x Melodic Lo-Fi",
            bpm: 122,
            title: "Lạc Lối Đêm Phố Thị",
            style: "Vietnamese Jerk Drill x Melodic Lo-Fi, 122 BPM, bouncy upbeat pulse with a melancholic sway. Saturated distorted 808s against chill lo-fi piano and crisp, syncopated claps. Low dark male and female vocals in smooth silky call-and-response, female soprano gliding between choppy rap phrases, gliding female rap against choppy male rap with backing voices. Viral TikTok-style arrangement with a sudden bass freeze and hook-led drops; springy 808 bass slides, chill lo-fi piano chords, rhythmic claps and finger snaps. Dynamic contrast between moody intimate verses and energetic bouncy hook drops. Wide stereo panning, tape warmth, punchy transients, pristine upfront vocal mix, radio-ready commercial master. NO monotone delivery, NO flat drops, NO muddy low-end, NO robotic autotune artifacts, NO harsh highs, NO slow tempo, NO acoustic ballad.",
            lyrics: `[Intro - Chill Lo-Fi Piano & Snaps]
(Syncopated claps, soft tape hiss, lo-fi piano chords)
[Low Male Voice] 122 BPM... Phố lên đèn rồi em.
[Female Soprano Gliding] Màn đêm buông xuống, liệu ai thật lòng?

[Verse 1 - Choppy Male Rap]
Đèn đường hắt hiu rọi góc phố thân quen
Bước chân vội vã tìm một khoảng trời riêng
Bao ánh nhìn phán xét, bao cám dỗ bủa vây
Ta giữ lại bản ngã giữa vòng xoáy đổi thay.
Đồng tiền làm mờ mắt, danh vọng làm người say
Nhưng chữ tâm chữ nghĩa, anh nắm chặt trong tay!

[Verse 1 - Gliding Female Soprano Rap]
Lướt qua ánh mắt sắc lạnh giữa màn đêm
Gió lay tà áo, nỗi cô đơn dày thêm
Người ta đến rồi đi tựa như làn khói mỏng
Chỉ có nhịp tim này chưa từng nguôi hy vọng.
Anh bảo vệ giấc mơ, em gạt đi dòng lệ
Giữa chốn thị phi ta cùng nhau vượt qua dâu bể!

[Pre-Chorus - Call-and-Response Duet]
[Male] Em có sợ ngày mai giông bão kéo về?
[Female] Bên anh rồi, đường gai góc cũng hóa bình yên!
[Male] Nhịp claps lệch điệu, bass bắt đầu siết chặt...
[Female] Nắm lấy tay em, đừng buông nhé người ơi!

[Bass Freeze]
(Tất cả âm thanh dừng lại 1 giây - Chỉ còn tiếng thở nhẹ)
[Female Hook] Phố thị không ngủ... ta thuộc về nhau!

[Drop - Bouncy 808 Jerk Drill]
(Distorted 808 bass slides, springy syncopated percussion, female vocal chops)

[Verse 2 - Choppy Male Rap with Female Backing]
Cứ để miệng đời thêu dệt những hoang đường
Thép đã tôi trong lửa, ta kiên cường dặm trường
Ánh hào quang lấp lánh chẳng mua nổi chân tình
Đêm tàn trời lại sáng, ta đón ánh bình minh.
Có em kề vai, hiểm nguy hóa nhẹ tênh
Vững bước ta đi, ghi tên mình lên đỉnh cao!

[Bridge - Melancholic Sway & Soft Piano]
Dưới ánh đèn neon lập lòe nơi góc tối
Ta tìm thấy nhau giữa muôn ngàn lạc lối
Dẫu cả thế gian quay lưng lại phía sau
Chỉ cần người thấu hiểu, đau đớn cũng phai màu...

[Bass Freeze - Hook]
[Duet] Phố thị đèn mờ... tình này chẳng phai!

[Drop - Final Climax]
(Maximum Saturated 808 Slides, High-Energy Jerk Drill Pulse & Ad-libs)

[Outro - Lo-Fi Piano fading out]
[Female Soprano] Lạc lối đêm nay... nhưng tìm thấy anh.
[Male Voice] Mãi mãi bên em.
[Fade Out]`
        },
        5: {
            id: 5,
            name: "Vietnamese Rumba x Latin Acoustic Ballad",
            bpm: 100,
            title: "Đêm Mưa Nhớ Người",
            style: "Vietnamese Rumba x Latin Acoustic Ballad, 100 BPM, warm romantic sway with nostalgic Latin-Vietnamese percussion. Delicate Spanish nylon-string acoustic guitar arpeggios and rhythmic rumba strums, warm melodic upright bass, syncopated congas, bongos, gentle shaker and crisp wooden rimshots. Sincere expressive warm mature male vocal, deep soulful phrasing, subtle vibrato, emotional romantic longing. Mellow vintage accordion fills, subtle warm string quartet pads, gentle Spanish trumpet accents in transitions. Intimate storytelling verses, passionate soaring melodic chorus, expressive acoustic guitar solo bridge, soft fading romantic outro. Wide acoustic stereo imaging, vintage tube console warmth, pristine vocal intimacy, broadcast-ready analog master. NO heavy synth, NO EDM drums, NO aggressive distortion, NO harsh autotune, NO robotic artifacts, NO fast beat.",
            lyrics: `[Intro - Spanish Nylon Guitar & Congas]
(Mellow acoustic guitar arpeggios, gentle shaker, slow rumba rhythm)

[Verse 1]
Từng hạt mưa rơi rớt bên hiên vắng lạnh lùng
Ngọn đèn khuya hắt hiu bóng ai trong màn sương
Gió đông về khẽ nhắc lại chuyện tình xưa
Thuở hai đứa chung đường, dưới cơn mưa chiều vội vã.

[Verse 2]
Thời gian trôi cuốn theo bao hẹn ước ban đầu
Người phương xa có còn nhớ mảnh trăng xưa?
Chén rượu nồng chẳng làm vơi đi nỗi nhớ
Chỉ thấy bóng hình em khắc sâu tận đáy lòng...

[Pre-Chorus]
Đàn ai buông tiếng rumba da diết
Rung lên từng cung bậc của nỗi tiếc thương
Biết duyên phận lỡ làng không chung lối
Sao ngàn năm lòng vẫn mãi vấn vương?

[Chorus]
Mưa vẫn rơi như tiếng lòng than khóc
Người ra đi mang theo nửa linh hồn
Đêm rumba trăn trở hoài kỷ niệm
Một thuở yêu người... trọn vẹn cả thanh xuân!

[Interlude - Acoustic Guitar & Accordion Solo]
(Soulful nylon guitar solo, warm accordion fills, conga groove)

[Verse 3]
Đời nổi trôi giữa muôn ngàn sóng gió
Gặp được nhau đã là một chữ duyên
Dẫu mai này đường trần chia hai ngả
Nguyện chúc người một đời vẹn bình yên.

[Bridge]
Nếu có ngày người ngoảnh lại phía sau
Vẫn thấy nơi đây một ngọn đèn le lói
Không oán hận, không một lời trách móc
Chỉ mong nụ cười em mãi nở trên môi...

[Chorus - Emotional Climax]
Mưa vẫn rơi như tiếng lòng than khóc
Người ra đi mang theo nửa linh hồn
Đêm rumba trăn trở hoài kỷ niệm
Một thuở yêu người... trọn vẹn cả thanh xuân!

[Outro - Gentle Nylon Guitar Solo]
(Soft congas fading out, delicate guitar strum)
Mưa đêm... nhớ người khôn nguôi.
[Fade Out]`
        },
        6: {
            id: 6,
            name: "Vietnamese Cha Cha Cha x Latin Big Band",
            bpm: 128,
            title: "Vũ Điệu Say Tình",
            style: "Vietnamese Cha Cha Cha x Modern Latin Big Band, 128 BPM, vibrant infectious dance rhythm with lively ballroom energy. Crisp syncopated cowbell, driving timbale fills, punchy congas, rhythmic guiro, bouncy electric bassline, playful Latin piano montuno riffs. Charismatic energetic male vocal with playful female backing harmonies, seductive phrasing, confident melodic delivery. Bright punchy brass section stabs, soulful muted trumpet solos, crisp handclaps, dynamic rhythmic breaks and dramatic brass swells. Dynamic build-up into an irresistible catchy dance chorus, energetic percussion breakdown bridge, triumphant celebratory climax outro. Wide panoramic stereo soundstage, punchy drum transients, pristine upfront vocal mix, radio-ready dancefloor master. NO slow ballad, NO muddy low-end, NO robotic vocal tuning, NO flat drums, NO weak drops, NO gloomy atmosphere.",
            lyrics: `[Intro - Cowbell & Brass Horns]
(One, two, cha-cha-cha! Bright horn stabs, driving timbales)
1, 2, 3... Khiêu vũ cùng anh nhé em!

[Verse 1]
Ánh đèn đêm lấp lánh soi rọi sàn khiêu vũ
Tiếng kèn đồng ngân vang giục giã bước chân say
Gạt đi bao muộn phiền của ngày dài đã qua
Hãy để âm nhạc dẫn lối đôi trái tim này!

[Verse 2]
Ánh mắt em trao mang ngọn lửa đam mê
Nhịp bước nhịp nhàng ta lạc vào cõi mê
Vòng tay anh siết nhẹ bên eo thon mềm mại
Dưới điệu Cha Cha Cha nồng nàn men say.

[Pre-Chorus]
1, 2, cha-cha-cha, bước chân ta nhịp nhàng
Quên đi hết âu lo, sống trọn với đam mê
Giai điệu Latin bùng cháy ngọn lửa tình
Đêm nay là của ta, hãy cháy hết mình đi em!

[Chorus]
Cùng hòa nhịp bước trong vũ điệu say tình
Tiếng kèn đồng ngân vang khúc ca rộn rã
Nắm chặt tay anh xoay tròn giữa sàn hoa
Yêu là đắm say, ngập tràn muôn sắc hoa!

[Interlude - Brass & Percussion Break]
(Timbale solo, congas groove, bright brass stabs)

[Verse 3]
Nhịp tim rộn ràng theo từng bước nhún nhảy
Hương thơm nồng nàn thoang thoảng bờ vai ai
Cuộc đời này ngắn ngủi, cớ sao phải chần chừ?
Hãy trao nhau nụ cười và khúc hát ban mai!

[Bridge]
Quên đi ngày hôm qua, đón lấy ánh rạng ngời
Cùng vũ điệu Latin làm say đắm đất trời
Chỉ cần ta bên nhau, ngập tràn niềm vui mới
Hạnh phúc giản đơn là tiếng cười thảnh thơi!

[Chorus - Maximum Energy Big Band]
Cùng hòa nhịp bước trong vũ điệu say tình
Tiếng kèn đồng ngân vang khúc ca rộn rã
Nắm chặt tay anh xoay tròn giữa sàn hoa
Yêu là đắm say, ngập tràn muôn sắc hoa!

[Outro]
(Cha-cha-cha! Final brass hit & laughter)
Vũ điệu say tình... ngập tràn hạnh phúc!`
        },
        7: {
            id: 7,
            name: "Vietnamese Western Bolero (Sông Nước Nam Bộ)",
            bpm: 78,
            title: "Thương Em Con Nước Vơi Đầy",
            style: "Vietnamese Western Bolero, 78 BPM slow gentle river sway, authentic Southern folk ballad. Melancholic Vietnamese scooped-fret guitar (guitar phim lom) with delicate weeping pitch bends, lyrical Dan Sen lute, warm resonant Dan Bau monochord glides, and subtle wooden song lang percussion. Sincere rustic Southern vocal (male or female), deep soulful phrasing, authentic vibrato, emotive delta storytelling. Soft acoustic nylon guitar, warm upright bass, nostalgic accordion fills, sweet distant bamboo flute. Intimate intro with folk chant (cau ho), tearful verses, soaring heartfelt chorus, emotional guitar solo bridge, fading peaceful outro. Wide acoustic stereo imaging, vintage tube analog console warmth, intimate pristine vocal mix, broadcast-ready master. NO EDM, NO fast beat, NO harsh autotune, NO modern synth, NO heavy drums, NO dance tempo.",
            lyrics: `[Intro - Câu Hò & Guitar Phím Lõm]
(Tiếng sóng vỗ mạn thuyền, tiếng hò ngân xa, guitar phím lõm luyến láy da diết)
[Hò]: Hò ơ... Gió đưa bông sậy về trời...
Chớ người thương ở lại... chịu đời đắng cay...

[Verse 1]
Chiều buông nghiêng bóng con đò nhỏ qua sông
Gió thổi bên sông nghe buốt lạnh trong lòng
Thương nhánh lục bình trôi dạt về nơi đâu
Như kiếp nghèo anh mang nặng một khối sầu.

[Verse 2]
Mấy mùa mưa nắng dãi dầu chốn miền quê
Vẫn nhớ câu thề ngày hai đứa chung đê
Em bảo đợi anh dẫu con nước vơi đầy
Sao nỡ vội quên bao ân tình đắp xây?

[Pre-Chorus]
Đàn sến buông lơi từng giọt sầu rơi rụng
Tiếng thở dài hòa cùng sóng nước mênh mông
Người ta giàu sang gấm lụa rước em về
Bỏ lại bến xưa một người hoài ngóng trông...

[Chorus]
Thương em con nước vơi đầy, lòng này ai thấu?
Bao nhiêu cay đắng anh gom giấu tận đáy lòng!
Phù sa bồi đắp cho ruộng đồng xanh mướt
Sao chẳng bồi đắp duyên mình được bền lâu?

[Interlude - Đàn Sến & Guitar Phím Lõm Miền Tây]
(Tiếng guitar phím lõm luyến láy nức nở, nhịp song lang gõ đều, đàn sến da diết)

[Verse 3]
Đêm lạnh Hậu Giang ánh trăng vàng soi bóng
Thắt thẻo câu hò ai hát giữa dòng sông
Đã lỡ cung đàn dang dở một đường tơ
Trách phận bèo mây chẳng giữ được chữ ngờ.

[Bridge - Tự Sự Miền Tây]
Nếu có kiếp sau xin làm nhánh bần trôi
Đứng đợi người xưa dẫu vật đổi sao dời
Không trách em đi theo bến đỗ sang giàu
Chỉ mong em cười... trọn vẹn kiếp mai sau...

[Chorus - Đậm Chất Miền Tây Ngân Dài Mùi Mẫn]
Thương em con nước vơi đầy, lòng này ai thấu?
Bao nhiêu cay đắng anh gom giấu tận đáy lòng!
Phù sa bồi đắp cho ruộng đồng xanh mướt
Sao chẳng bồi đắp duyên mình được bền lâu?

[Outro - Tiếng Hò Buông Lơi]
(Guitar phím lõm gảy nốt trầm, sóng vỗ nhẹ)
Nước chảy xuôi dòng...
Tình nghèo... gửi lại dòng sông.
[Fade Out]`
        },
        8: {
            id: 8,
            name: "Ballad Hiện Đại x Đàn Tranh & Đàn Bầu",
            bpm: 105,
            title: "Bến Trăng Vọng Nguyệt",
            style: "Modern Vietnamese Folk Pop Ballad, 105 BPM upbeat driving tempo, captivating rhythm. Virtuosic Vietnamese Dan Tranh (zither) intricate pentatonic cascades, expressive Dan Bau (monochord) emotional bending and rich vibrato. Expressive male or female vocal, rich traditional melisma, graceful vocal ornamentations, soaring sustained high notes. Emotional grand piano chords, lush cinematic strings build-up, punchy pop drum groove, warm sub bass. Dramatic explosive crescendo expanding into an anthemic soaring chorus, emotional bridge with Dan Tranh and Dan Bau duel solo. Vocal treated with bright plate reverb and silky spacious hall ambience, pristine upfront vocal mix, radio-ready broadcast master. Dynamic arrangement from intimate folk verses to epic cathartic climax. NO flat chorus, NO slow tempo, NO dull vocal, NO muddy low-end, NO harsh autotune, NO robotic artifacts.",
            lyrics: `[Intro - Đàn Tranh & Đàn Bầu Solo]
(Tiếng đàn tranh tỉa giọt mưa lả lướt, đàn bầu ngân rung bổng trầm, piano đệm nhẹ)

[Verse 1]
Màn đêm buông xuống bến sông ánh trăng soi nghiêng
Từng phím tơ vương tiếng đàn ai oán ưu phiền
Người đi biền biệt khuất mờ sau làn sương khói
Gió lay rèm thưa để lại muôn vàn nhức nhối.

[Verse 2]
Cung đàn buông lơi trách người sao vội sang ngang
Đành lòng chôn giấu mối duyên xưa dẫu lỡ làng
Rượu nồng chưa nhấp mà lòng đã say men đắng
Ánh trăng tàn phai rơi rớt giữa trời hoang vắng.

[Pre-Chorus]
(Nhịp trống dồn dập, tiết tấu tăng dần cuốn hút, đàn dây cuộn trào)
Đàn tranh réo rắt khơi bừng lên bao vết thương sâu
Đàn bầu ngân nga tiếc cho duyên kiếp ban đầu
Nấc nghẹn từng cơn giữa đêm lạnh lùng băng giá
Bước chân người đi... sao nỡ vô tình rời xa?

[Chorus - Cao Trào Mở Rộng Bùng Nổ]
(Bright plate reverb, vocal ngân dài phiêu luyến, không gian vang mượt)
Nguyện hóa cánh chim trời bay qua muôn trùng bão giông!
Tìm lại ký ức một thời son sắt bên dòng sông
Dẫu biết trăm năm tình này hóa thành tro bụi
Vẫn đợi người về... dẫu bạc trắng cả thanh xuân!

[Interlude - Đàn Tranh Luyến Láy & Đàn Bầu Ngân Rung Solo]
(Đàn tranh tỉa ngũ cung dồn dập, đàn bầu uốn nốt nức nở, trống pop hiện đại hòa quyện)

[Verse 3]
Thời gian trôi mãi cuốn trôi đi bao lời hẹn ước
Ngoảnh lại nhìn nhau giọt lệ vương sầu mi ướt
Trách trời cao xanh sao nỡ gieo chi ngang trái
Để mối tơ duyên ngàn kiếp chẳng thể nguôi ngoai!

[Bridge - Đỉnh Điểm Cảm Xúc]
Mượn chén trăng tàn chúc người một đời an yên
Dẫu trái tim này mang nặng muôn ngàn oan khiên
Đàn tranh đứt đoạn... đàn bầu nghẹn ngào buông lơi
Kiếp này lỡ hẹn... xin hẹn người ở kiếp sau!

[Chorus - Cao Trào Mở Rộng Bùng Nổ Plate Reverb]
Nguyện hóa cánh chim trời bay qua muôn trùng bão giông!
Tìm lại ký ức một thời son sắt bên dòng sông
Dẫu biết trăm năm tình này hóa thành tro bụi
Vẫn đợi người về... dẫu bạc trắng cả thanh xuân!

[Outro - Tiếng Đàn Bầu Ngân Dài Chìm Dần]
(Đàn bầu rung nốt dài thăm thẳm, plate reverb vang mượt mờ dần)
Bến trăng xưa...
Vẫn ngóng đợi người...
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
    function selectStyleCard(card) {
        if (!card) return;
        styleCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        currentSunoStyleId = parseInt(card.getAttribute('data-style'));

        // Đồng bộ thể loại ngay lập tức sang Tab 3
        if (auditGenreSelect && STYLE_TO_AUDIT_GENRE[currentSunoStyleId]) {
            auditGenreSelect.value = STYLE_TO_AUDIT_GENRE[currentSunoStyleId];
        }
    }

    styleCards.forEach(card => {
        card.addEventListener('click', () => {
            selectStyleCard(card);
        });
    });

    // Helper: Xử lý thay đổi BPM tùy chỉnh cho từng thể loại
    function handleBpmChange(styleId, newBpmVal) {
        let newBpm = parseInt(newBpmVal, 10);
        if (isNaN(newBpm)) return;
        newBpm = Math.max(40, Math.min(240, newBpm));

        // Cập nhật giá trị hiển thị trong ô input
        const card = document.querySelector(`.style-card[data-style="${styleId}"]`);
        if (card) {
            const input = card.querySelector('.bpm-input');
            if (input && parseInt(input.value, 10) !== newBpm) {
                input.value = newBpm;
            }
        }

        // Cập nhật vào SUNO_PRESETS
        if (SUNO_PRESETS[styleId]) {
            const oldBpm = SUNO_PRESETS[styleId].bpm;
            SUNO_PRESETS[styleId].bpm = newBpm;

            // Cập nhật BPM trong chuỗi style prompt của preset
            SUNO_PRESETS[styleId].style = SUNO_PRESETS[styleId].style.replace(
                /\b\d{2,3}\s*BPM\b/gi,
                `${newBpm} BPM`
            );

            // Cập nhật BPM trong lời bài hát mẫu (nếu có)
            if (SUNO_PRESETS[styleId].lyrics) {
                SUNO_PRESETS[styleId].lyrics = SUNO_PRESETS[styleId].lyrics.replace(
                    new RegExp(`\\b(${oldBpm}|\\d{2,3})\\s*(BPM|nhịp đập)\\b`, 'gi'),
                    (match, p1, p2) => `${newBpm} ${p2}`
                );
            }
        }

        // Nếu đây là thể loại đang chọn và ô outSunoStyle đang hiển thị nội dung: Cập nhật realtime
        if (currentSunoStyleId === styleId && outSunoStyle && outSunoStyle.value) {
            outSunoStyle.value = outSunoStyle.value.replace(
                /\b\d{2,3}\s*BPM\b/gi,
                `${newBpm} BPM`
            );
            updateSunoStyleCount();
        }
    }

    // Gán sự kiện nút Tăng/Giảm (+) (-) và nhập trực tiếp BPM
    document.querySelectorAll('.bpm-stepper').forEach(stepper => {
        const styleId = parseInt(stepper.getAttribute('data-style'));
        const minusBtn = stepper.querySelector('.btn-bpm-minus');
        const plusBtn = stepper.querySelector('.btn-bpm-plus');
        const input = stepper.querySelector('.bpm-input');

        // Bấm nút Giảm (-)
        if (minusBtn && input) {
            minusBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = stepper.closest('.style-card');
                if (card) selectStyleCard(card);

                let currentVal = parseInt(input.value, 10) || SUNO_PRESETS[styleId]?.bpm || 120;
                let nextVal = Math.max(40, currentVal - 1);
                input.value = nextVal;
                handleBpmChange(styleId, nextVal);
            });
        }

        // Bấm nút Tăng (+)
        if (plusBtn && input) {
            plusBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = stepper.closest('.style-card');
                if (card) selectStyleCard(card);

                let currentVal = parseInt(input.value, 10) || SUNO_PRESETS[styleId]?.bpm || 120;
                let nextVal = Math.min(240, currentVal + 1);
                input.value = nextVal;
                handleBpmChange(styleId, nextVal);
            });
        }

        // Nhập trực tiếp vào ô input số
        if (input) {
            input.addEventListener('click', (e) => {
                e.stopPropagation();
            });
            input.addEventListener('input', () => {
                let val = parseInt(input.value, 10);
                if (!isNaN(val)) {
                    handleBpmChange(styleId, val);
                }
            });
            input.addEventListener('change', () => {
                let val = parseInt(input.value, 10);
                if (isNaN(val) || val < 40) val = 40;
                if (val > 240) val = 240;
                input.value = val;
                handleBpmChange(styleId, val);
            });
        }
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

    // Chọn nhanh gợi ý chủ đề trong Tab Suno & Đồng bộ ngay sang Tab 3
    document.querySelectorAll('.tag-chip[data-topic]').forEach(chip => {
        chip.addEventListener('click', () => {
            const topicText = chip.getAttribute('data-topic');
            if (topicText) {
                if (sunoTopic.value.trim() === '') {
                    sunoTopic.value = topicText;
                } else {
                    sunoTopic.value += ', ' + topicText;
                }
                // Đồng bộ ngay lập tức sang Tab 3
                if (auditTopic) {
                    auditTopic.value = sunoTopic.value;
                }
            }
        });
    });

    // Lắng nghe gõ phím ở ô Chủ đề Tab Suno để đồng bộ sang Tab 3
    if (sunoTopic) {
        sunoTopic.addEventListener('input', () => {
            if (auditTopic) {
                auditTopic.value = sunoTopic.value;
            }
        });
    }

    // Lắng nghe gõ tiêu đề ở Tab Suno để đồng bộ sang Tab 3
    if (sunoInputTitle) {
        sunoInputTitle.addEventListener('input', () => {
            if (auditSongTitle) {
                auditSongTitle.value = sunoInputTitle.value;
            }
        });
    }

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

        // Tự động đồng bộ sang Tab 3
        if (auditSongTitle) auditSongTitle.value = preset.title;
        if (auditLyricsInput) auditLyricsInput.value = preset.lyrics;
        if (auditTopic && sunoTopic.value.trim()) auditTopic.value = sunoTopic.value;
        if (auditGenreSelect && STYLE_TO_AUDIT_GENRE[currentSunoStyleId]) {
            auditGenreSelect.value = STYLE_TO_AUDIT_GENRE[currentSunoStyleId];
        }
        updateAuditLyricsCount();
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

        // Đồng bộ chủ đề và thể loại sang Tab 3 ngay khi bắt đầu tạo bài
        if (auditTopic) auditTopic.value = topic;
        if (auditSongTitle && inputTitle) auditSongTitle.value = inputTitle;
        if (auditGenreSelect && STYLE_TO_AUDIT_GENRE[currentSunoStyleId]) {
            auditGenreSelect.value = STYLE_TO_AUDIT_GENRE[currentSunoStyleId];
        }
        if (auditPolishedLyrics) auditPolishedLyrics.value = '';
        if (auditOutputContent) auditOutputContent.style.display = 'none';
        if (auditLoader) auditLoader.style.display = 'none';
        if (auditEmptyOutput) auditEmptyOutput.style.display = 'flex';
        if (auditExportActions) auditExportActions.style.display = 'none';
        currentAuditData = null;

        // Reset BPM về mặc định ban đầu
        const defaultBpms = { 1: 128, 2: 140, 3: 82, 4: 122, 5: 100, 6: 128, 7: 78, 8: 105 };
        document.querySelectorAll('.bpm-input').forEach(inp => {
            const st = inp.closest('.bpm-stepper')?.getAttribute('data-style');
            if (st && defaultBpms[st]) {
                inp.value = defaultBpms[st];
                handleBpmChange(parseInt(st), defaultBpms[st]);
            }
        });

        const prompt = `Bạn là một NHẠC SĨ CA TỪ & BẬC THẦY THI CA ÂM NHẠC HÀNG ĐẦU VIỆT NAM (Master Vietnamese Lyricist & Poetic Songwriter), am hiểu sâu sắc về âm luật thơ ca tiếng Việt, thanh điệu bằng - trắc, nhịp phách và kỹ nghệ Suno AI Prompt Engineering.

THÔNG TIN ĐẦU VÀO TỪ NGƯỜI DÙNG:
${inputTitle ? `- TIÊU ĐỀ BÀI HÁT: "${inputTitle}" (QUY TẮC BẮT BUỘC: TIÊU ĐỀ NÀY CHÍNH LÀ LINH HỒN, ĐỀ TÀI VÀ CỐT LÕI CỦA BÀI HÁT)` : '- TIÊU ĐỀ BÀI HÁT: Tự đặt tên bài hát thật sâu sắc, cuốn hút và đúng tâm trạng'}
- Thể loại âm nhạc: ${preset.name} (${preset.bpm} BPM).
- Chủ đề & Cảm xúc: ${topic || (inputTitle ? `Khai thác sâu sắc câu chuyện và cảm xúc xoay quanh tiêu đề "${inputTitle}"` : 'Tình yêu chân thành, bền chặt bất chấp năm tháng đổi thay')}
- Điểm nhấn / Câu Hook: ${hook || (inputTitle ? `Lồng ghép từ khóa tiêu đề "${inputTitle}" vào câu hook hoặc điệp khúc` : (currentSunoStyleId === 2 ? 'Ngoài kia mọi thứ đổi thay, riêng tình anh chẳng đổi thay.' : (currentSunoStyleId === 4 ? 'Phố thị không ngủ, ta thuộc về nhau.' : (currentSunoStyleId === 5 ? 'Một thuở yêu người, trọn vẹn cả thanh xuân.' : (currentSunoStyleId === 6 ? '1, 2, cha-cha-cha, hãy giữ chặt tay nhau!' : (currentSunoStyleId === 7 ? 'Thương em một đời, son sắt tình phù sa.' : (currentSunoStyleId === 8 ? 'Đàn buông tiếng tơ, ngàn năm luyến nhớ bóng hình xưa.' : '')))))))}

========================================================================
YÊU CẦU ĐẶC BIỆT CỐT LÕI: "LỜI NHẠC PHẢI CHẠM SÂU TÂM TRẠNG & GIEO VẦN CHUẨN XÁC VỚI NHAU"
========================================================================

⭐ NGUYÊN TẮC 1: NGHỆ THUẬT CHẠM SÂU TÂM TRẠNG (DEEP EMOTIONAL RESONANCE)
1. BÀI TRỪ TUYỆT ĐỐI SÁO RỖNG (Zero Clichés):
   - KHÔNG dùng câu chữ hời hợt, vô cảm kiểu: "anh yêu em nhiều lắm", "chúng ta bên nhau", "em ra đi để lại nỗi đau vô bờ", "trái tim anh tan nát"...
   - NGHỆ THUẬT TẢ CẢNH NGỤ TÌNH & HÌNH TƯỢNG ĐIỆN ẢNH: Sử dụng chi tiết đắt giá chạm vào tiềm thức người nghe (ngọn đèn vàng hắt hiu bóng lẻ, tàn thuốc khuya bên tách cà phê nguội, ngã rẽ cuộc đời buông lơi cái nắm tay, giọt mưa đêm gõ nhịp bên song cửa, chiếc áo cũ sờn phai màu ký ức...).
2. DIỄN BIẾN TÂM TRẠNG THEO LỚP LANG TỰ SỰ:
   - [Verse 1]: Mở ra không gian, bối cảnh chân thực và nỗi niềm chất chứa, đặt nhân vật vào một trạng thái cảm xúc tự sự lắng đọng.
   - [Pre-Chorus]: Nhịp điệu dồn nén, cảm xúc cuộn trào, những giằng xé nội tâm nghẹn ngào chuẩn bị bùng nổ.
   - [Chorus]: Đỉnh cao bùng nổ cảm xúc! Chứa đựng câu HOOK đắt giá nhất, từ ngữ giàu triết lý nhân sinh, găm sâu vào tim người nghe.
   - [Verse 2]: Không lặp lại ý Verse 1, mà đào sâu vào ký ức, góc khuất tâm lý hoặc thực tại trớ trêu.
   - [Bridge]: Khúc quanh cảm xúc, sự đốn ngộ, thức tỉnh, xót xa tột cùng hoặc lời nhắn nhủ thiêng liêng, vị tha xé lòng.
   - [Outro]: Dư âm lắng đọng, câu chốt nhẹ buông để lại khoảng lặng bồi hồi khôn nguôi.
3. BÁM SÁT TIÊU ĐỀ "${inputTitle || 'tiêu đề'}":
   - Từ khóa tiêu đề phải xuất hiện đắt giá ở vị trí trang trọng trong [Chorus] hoặc [Hook].

⭐ NGUYÊN TẮC 2: QUY TẮC GIEO VẦN BẬC THẦY TIẾNG VIỆT (VIETNAMESE RHYME & TONE HARMONY)
1. BẮT BUỘC GIEO VẦN CHÂN (CƯỚC VẬN - END RHYME):
   - Từng khổ 4 câu (hoặc cặp 2 câu) PHẢI ăn vần chặt chẽ với nhau theo cấu trúc AABB hoặc ABAB.
   - Vần phải tự nhiên, khít khao, tuyệt đối KHÔNG ép vần gượng gạo khiến câu văn ngô nghê.
2. NGHỆ THUẬT GIEO VẦN LƯNG (YÊU VẬN - INTERNAL RHYME):
   - Chữ cuối của câu trước bắt vần với chữ thứ 3, 4 hoặc 5 của câu sau để tạo dòng chảy giai điệu mượt mà, cuốn hút.
3. PHỐI THANH ĐIỆU BẰNG - TRẮC (TONE HARMONY):
   - CUỐI CÂU ĐIỆP KHÚC & CUỐI BÀI BẮT BUỘC BUÔNG THANH BẰNG (Không dấu hoặc Dấu Huyền: ơi, trôi, đời, người, vơi, say, mai...): Tạo độ ngân vang tha thiết, truyền cảm khi ca sĩ hát nốt cao hoặc phiêu luyến.
   - Giữa câu gài thanh TRẮC (Sắc, Hỏi, Ngã, Nặng) tạo độ nén, nhấn nhá day dứt, biểu đạt nỗi niềm trăn trở.
4. NHỊP ĐIỆU & ĐỘ DÀI CÂU ĐỒNG ĐỀU (METER & RHYTHM):
   - Số chữ trong các cặp câu phải cân đối (khổ 7-7 chữ, 8-8 chữ hoặc 6-8), không viết câu dài lê thê vụng về khiến Suno AI bị vấp nhịp.

⭐ NGUYÊN TẮC 3: CẤU TRÚC BÀI HÁT TỐI ƯU CHO SUNO AI
Bao gồm đầy đủ các thẻ meta:
[Intro]
[Verse 1]
[Pre-Chorus]
[Chorus]
${currentSunoStyleId === 4 ? '[Bass Freeze - Hook]\n[Drop - Bouncy 808 Jerk Drill]' : (currentSunoStyleId === 3 ? '[Interlude - Soaring Cello & Strings Solo]' : (currentSunoStyleId === 5 ? '[Interlude - Spanish Guitar Solo]' : (currentSunoStyleId === 6 ? '[Brass Break - Percussion Solo]' : (currentSunoStyleId === 7 ? '[Interlude - Đàn Sến & Guitar Phím Lõm Miền Tây]' : (currentSunoStyleId === 8 ? '[Interlude - Đàn Tranh Luyến Láy & Đàn Bầu Ngân Rung Solo]' : '[Drop]')))))}
[Verse 2]
[Chorus]
[Bridge]
${currentSunoStyleId === 4 ? '[Bass Freeze - Hook]\n[Drop - Final Climax]' : (currentSunoStyleId === 3 ? '[Chorus - Climax Full Strings]' : (currentSunoStyleId === 5 ? '[Chorus - Emotional Climax]' : (currentSunoStyleId === 6 ? '[Chorus - Maximum Energy Big Band]' : (currentSunoStyleId === 7 ? '[Chorus - Đậm Chất Miền Tây Ngân Dài Mùi Mẫn]' : (currentSunoStyleId === 8 ? '[Chorus - Cao Trào Mở Rộng Bùng Nổ Plate Reverb]' : '[Drop - Final Climax]')))))}
[Outro]

⭐ NGUYÊN TẮC 4: PROMPT STYLE TIẾNG ANH CHO SUNO AI
- ĐỘ DÀI BẮT BUỘC: TỪ 800 ĐẾN 920 KÝ TỰ (830 - 890 ký tự là tối ưu).
- Dựa trên phong cách kỹ thuật:
  ${preset.style}
- Tùy chỉnh chi tiết cho khớp với tâm trạng, tiêu đề (${inputTitle || 'deep emotional theme'}) và hook, giữ vững BPM, nhạc cụ, vocal, mastering, và negative tags (NO ...).

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

            // Tự động đồng bộ toàn bộ Lời, Tiêu đề, Chủ đề và Thể loại sang Tab 3
            if (auditSongTitle) auditSongTitle.value = outSunoTitle.value;
            if (auditLyricsInput) auditLyricsInput.value = outSunoLyrics.value;
            if (auditTopic && sunoTopic.value.trim()) auditTopic.value = sunoTopic.value.trim();
            if (auditGenreSelect && STYLE_TO_AUDIT_GENRE[currentSunoStyleId]) {
                auditGenreSelect.value = STYLE_TO_AUDIT_GENRE[currentSunoStyleId];
            }
            updateAuditLyricsCount();

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


    // ==========================================
    // TAB 3: THẨM ĐỊNH & NÂNG CẤP LỜI CHUYÊN SÂU
    // ==========================================
    const auditGenreSelect = document.getElementById('auditGenreSelect');
    const auditSongTitle = document.getElementById('auditSongTitle');
    const auditTopic = document.getElementById('auditTopic');
    const auditLyricsInput = document.getElementById('auditLyricsInput');
    const auditLyricsCount = document.getElementById('auditLyricsCount');
    const btnPasteFromSuno = document.getElementById('btnPasteFromSuno');
    const btnSampleAuditLyrics = document.getElementById('btnSampleAuditLyrics');
    const btnRunAudit = document.getElementById('btnRunAudit');
    const btnResetAudit = document.getElementById('btnResetAudit');
    const auditLoader = document.getElementById('auditLoader');
    const auditEmptyOutput = document.getElementById('auditEmptyOutput');
    const auditOutputContent = document.getElementById('auditOutputContent');
    const auditExportActions = document.getElementById('auditExportActions');
    const auditOverallScore = document.getElementById('auditOverallScore');
    const auditScoreRating = document.getElementById('auditScoreRating');
    const auditGeneralReview = document.getElementById('auditGeneralReview');
    const scoreEmotional = document.getElementById('scoreEmotional');
    const barEmotional = document.getElementById('barEmotional');
    const scoreRhyme = document.getElementById('scoreRhyme');
    const barRhyme = document.getElementById('barRhyme');
    const scoreGenre = document.getElementById('scoreGenre');
    const barGenre = document.getElementById('barGenre');
    const scoreImagery = document.getElementById('scoreImagery');
    const barImagery = document.getElementById('barImagery');
    const auditWeakList = document.getElementById('auditWeakList');
    const auditStrongList = document.getElementById('auditStrongList');
    const auditImprovementsList = document.getElementById('auditImprovementsList');
    const auditPolishedLyrics = document.getElementById('auditPolishedLyrics');
    const btnCopyAuditLyrics = document.getElementById('btnCopyAuditLyrics');
    const btnCopyPolishedLyrics = document.getElementById('btnCopyPolishedLyrics');
    const btnSendAuditToSuno = document.getElementById('btnSendAuditToSuno');
    const btnSendToSunoBottom = document.getElementById('btnSendToSunoBottom');
    const btnExportAuditTxt = document.getElementById('btnExportAuditTxt');

    let currentAuditData = null;

    // Đếm số từ và số dòng của ô lời bài hát
    function updateAuditLyricsCount() {
        if (!auditLyricsInput || !auditLyricsCount) return;
        const text = auditLyricsInput.value.trim();
        if (!text) {
            auditLyricsCount.innerText = '0 từ • 0 dòng';
            return;
        }
        const words = text.split(/\s+/).filter(Boolean).length;
        const lines = text.split('\n').filter(l => l.trim() !== '').length;
        auditLyricsCount.innerText = `${words} từ • ${lines} dòng`;
    }

    if (auditLyricsInput) {
        auditLyricsInput.addEventListener('input', updateAuditLyricsCount);
    }

    // Chip chọn nhanh thể loại trong Tab 3
    document.querySelectorAll('.audit-genre-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const g = chip.getAttribute('data-genre');
            if (auditGenreSelect && g) {
                auditGenreSelect.value = g;
            }
        });
    });

    // Chip chọn nhanh chủ đề trong Tab 3
    document.querySelectorAll('.audit-topic-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const t = chip.getAttribute('data-topic');
            if (auditTopic && t) {
                if (auditTopic.value.trim() === '') {
                    auditTopic.value = t;
                } else {
                    auditTopic.value += ', ' + t;
                }
            }
        });
    });

    // Hàm đồng bộ toàn diện từ Tab Suno sang Tab Thẩm Định
    function syncSunoToAudit() {
        if (!auditTopic) return;
        // 1. Đồng bộ chủ đề
        if (sunoTopic && sunoTopic.value.trim()) {
            auditTopic.value = sunoTopic.value.trim();
        }
        // 2. Đồng bộ thể loại
        if (auditGenreSelect && currentSunoStyleId && STYLE_TO_AUDIT_GENRE[currentSunoStyleId]) {
            auditGenreSelect.value = STYLE_TO_AUDIT_GENRE[currentSunoStyleId];
        }
        // 3. Đồng bộ tiêu đề
        const titleVal = (outSunoTitle && outSunoTitle.value.trim()) || (sunoInputTitle && sunoInputTitle.value.trim()) || '';
        if (titleVal && auditSongTitle && !auditSongTitle.value.trim()) {
            auditSongTitle.value = titleVal;
        }
        // 4. Đồng bộ lời nếu bên Tab 3 đang trống mà bên Tab 2 đã có lời
        if (outSunoLyrics && outSunoLyrics.value.trim() && auditLyricsInput && !auditLyricsInput.value.trim()) {
            auditLyricsInput.value = outSunoLyrics.value.trim();
            updateAuditLyricsCount();
        }
    }

    // Nút bấm đồng bộ nhanh chủ đề từ Tab Suno
    const btnSyncTopicFromSuno = document.getElementById('btnSyncTopicFromSuno');
    if (btnSyncTopicFromSuno) {
        btnSyncTopicFromSuno.addEventListener('click', () => {
            if (sunoTopic && sunoTopic.value.trim()) {
                auditTopic.value = sunoTopic.value.trim();
                if (auditGenreSelect && currentSunoStyleId && STYLE_TO_AUDIT_GENRE[currentSunoStyleId]) {
                    auditGenreSelect.value = STYLE_TO_AUDIT_GENRE[currentSunoStyleId];
                }
                const previewText = sunoTopic.value.trim().length > 60 ? sunoTopic.value.trim().substring(0, 60) + '...' : sunoTopic.value.trim();
                alert('Đã đồng bộ Chủ đề & Thể loại từ Tab Suno:\n"' + previewText + '"');
            } else {
                alert('Bên Tab Suno chưa nhập hoặc chưa chọn chủ đề nào để đồng bộ!');
            }
        });
    }

    // Lấy toàn bộ Lời & Chủ đề trực tiếp từ Tab Suno AI Studio sang Tab 3
    if (btnPasteFromSuno) {
        btnPasteFromSuno.addEventListener('click', () => {
            let syncedItems = [];
            // Lời
            if (outSunoLyrics && outSunoLyrics.value.trim()) {
                auditLyricsInput.value = outSunoLyrics.value.trim();
                updateAuditLyricsCount();
                syncedItems.push('Lời bài hát');
            }
            // Tiêu đề
            const t = (outSunoTitle && outSunoTitle.value.trim()) || (sunoInputTitle && sunoInputTitle.value.trim());
            if (t && auditSongTitle) {
                auditSongTitle.value = t;
                syncedItems.push('Tiêu đề');
            }
            // Chủ đề
            if (sunoTopic && sunoTopic.value.trim() && auditTopic) {
                auditTopic.value = sunoTopic.value.trim();
                syncedItems.push('Chủ đề & Cảm xúc');
            }
            // Thể loại
            if (auditGenreSelect && currentSunoStyleId && STYLE_TO_AUDIT_GENRE[currentSunoStyleId]) {
                auditGenreSelect.value = STYLE_TO_AUDIT_GENRE[currentSunoStyleId];
                syncedItems.push('Thể loại');
            }

            if (syncedItems.length > 0) {
                alert('Đã đồng bộ thành công (' + syncedItems.join(', ') + ') từ Tab Suno AI Studio sang Tab Kiểm Tra Lời!');
            } else {
                alert('Bên Tab Suno hiện chưa có nội dung để đồng bộ. Hãy chọn chủ đề hoặc tạo bài ở Tab Suno trước!');
            }
        });
    }

    // Nạp bài hát mẫu cần kiểm tra thử nghiệm
    if (btnSampleAuditLyrics) {
        btnSampleAuditLyrics.addEventListener('click', () => {
            auditSongTitle.value = 'Chẳng Đổi Thay (Bản Thô Cần Nâng Cấp)';
            auditGenreSelect.value = 'vinahouse';
            auditTopic.value = 'Tình yêu chân thành bền bỉ bất chấp năm tháng đổi thay, dù xa cách hay giông bão vẫn một lòng hướng về nhau';
            auditLyricsInput.value = `[Intro - Vocal Hook]
Ngoài kia đổi thay rồi
Anh vẫn thế thôi em ơi.

[Verse 1]
Thành phố này đông người quá em ơi
Anh đi làm về một mình buồn ghê
Nhớ em nhiều nhưng chẳng biết nói gì
Chỉ mong em đừng bao giờ quên anh.

[Pre-Chorus]
Cuộc sống ngoài kia có bao nhiêu cám dỗ
Liệu em có giữ lời hứa ngày xưa?
Đừng làm anh khóc nhé người ơi
Vì tim anh chỉ có mỗi em thôi.

[Chorus]
Ngoài kia mọi thứ đổi thay, riêng tình anh chẳng đổi thay
Dù cho bão giông hay nắng tắt anh vẫn đợi đây
Yêu em bằng cả con tim này thật lòng
Mong ngày sau chúng ta về chung một nhà.

[Drop]
(Vinahouse Bass Drop)

[Verse 2]
Nhiều khi anh thấy mệt mỏi trong lòng
Chỉ muốn có em ở bên ôm chặt
Mong sao tương lai hai đứa bình yên
Không còn những nỗi buồn phiền vương mi.

[Bridge]
Thời gian trôi nhanh quá em à
Vật đổi sao dời ai biết được đâu
Chỉ cần hai đứa luôn tin tưởng nhau
Thì bão giông nào cũng sẽ qua mau!

[Chorus]
Ngoài kia mọi thứ đổi thay, riêng tình anh chẳng đổi thay
Dù cho bão giông hay nắng tắt anh vẫn đợi đây
Yêu em bằng cả con tim này thật lòng
Mong ngày sau chúng ta về chung một nhà.

[Outro]
Mãi yêu em...
Đừng đổi thay nhé em.`;
            updateAuditLyricsCount();
        });
    }

    // Chạy thẩm định & nâng cấp lời bài hát bằng Gemini AI
    if (btnRunAudit) {
        btnRunAudit.addEventListener('click', async () => {
            const auditKey = (auditApiKeyInput && auditApiKeyInput.value.trim()) || (localStorage.getItem('auditGeminiApiKey') || '').trim();
            if (!auditKey) {
                alert('Vui lòng nhập Google Gemini API Key riêng cho Tab Thẩm Định Lời.');
                if (auditApiKeyInput) auditApiKeyInput.focus();
                return;
            }
            localStorage.setItem('auditGeminiApiKey', auditKey);
            const apiKey = auditKey;

            const rawLyrics = auditLyricsInput.value.trim();
            if (!rawLyrics) {
                alert('Vui lòng nhập hoặc dán lời bài hát cần kiểm tra!');
                auditLyricsInput.focus();
                return;
            }

            const genreName = auditGenreSelect.options[auditGenreSelect.selectedIndex].text;
            const songTitle = auditSongTitle.value.trim() || 'Chưa đặt tiêu đề';
            const topic = auditTopic.value.trim() || 'Khai thác cảm xúc sâu sắc theo ngữ cảnh bài hát';

            // Hiện loader
            if (auditEmptyOutput) auditEmptyOutput.style.display = 'none';
            if (auditOutputContent) auditOutputContent.style.display = 'none';
            if (auditExportActions) auditExportActions.style.display = 'none';
            if (auditLoader) auditLoader.style.display = 'block';

            const auditPrompt = `Bạn là một BẬC THẦY THẨM ĐỊNH & SÁNG TÁC CA TỪ HÀNG ĐẦU VIỆT NAM (Master Lyricist, Poetic Songwriter & Vocal Coach).
Bạn có đôi tai thẩm âm tinh tế, am hiểu sâu sắc về thanh điệu tiếng Việt (bằng - trắc, gieo vần chân, vần lưng, vần liên tiếp, vần đa âm tiết), nhạc lý cảm xúc, và đặc tính nhịp điệu của từng thể loại nhạc.

DƯỚI ĐÂY LÀ THÔNG TIN BÀI HÁT CẦN THẨM ĐỊNH & NÂNG CẤP CHUYÊN SÂU:
- TIÊU ĐỀ BÀI HÁT: "${songTitle}"
- THỂ LOẠI ÂM NHẠC: ${genreName}
- CHỦ ĐỀ & CẢM XÚC CỐT LÕI: ${topic}
- BẢN LỜI GỐC CẦN KIỂM TRA:
${rawLyrics}

NHIỆM VỤ CỐT LÕI CỦA BẠN:
1. ĐÁNH GIÁ CHUYÊN SÂU VÀ CHẤM ĐIỂM (Thang điểm 1.0 đến 10.0):
   - Độ chạm cảm xúc (emotionalResonance): Ca từ có thật sự lay động, chân thành, chạm đáy tâm can hay còn sáo rỗng, hời hợt, giả tạo?
   - Vần điệu & Bằng trắc (rhymeAndFlow): Đánh giá độ khít khao của vần chân, vần lưng, quy tắc buông thanh Bằng ở cuối câu và sự tự nhiên khi hát lên không bị gượng gạo hay ép vần.
   - Nhịp điệu & Độ khít Thể loại (genreFit): Câu từ có ăn khớp với nhịp phách, tiết tấu và năng lượng đặc trưng của thể loại (${genreName}) hay không?
   - Tính độc đáo & Triết lý (creativeImagery): Hình tượng thơ ca, sự mới mẻ trong ví von tả cảnh ngụ tình, có câu chốt nào đắt giá, viral không?
   - Điểm tổng quan (overallScore): Trung bình có trọng số.
   - Nhận định tổng quan (generalReview): Viết đoạn văn súc tích, sắc sảo từ góc nhìn chuyên gia.

2. BẮT BỆNH CA TỪ (Weak Points):
   - Chỉ ra chính xác 3-5 câu/cụm từ còn sáo rỗng, nông cạn, vụng về hoặc gượng ép vần trong bản gốc và giải thích vì sao.

3. ĐIỂM SÁNG CA TỪ (Strong Points):
   - Ghi nhận 2-3 điểm tích cực hoặc ý niệm tốt đẹp trong lời gốc.

4. BẢNG SO SÁNH & GỢI Ý NÂNG CẤP TỪNG ĐOẠN (Line Improvements):
   - Chọn ra 3-5 câu yếu nhất, nâng cấp thành câu mới chạm sâu tâm can, gieo vần điêu luyện và giải thích lý do.

5. PHIÊN BẢN LỜI BÀI HÁT HOÀN CHỈNH NÂNG CẤP ĐỈNH CAO (polishedLyrics):
   - BẮT BUỘC viết lại toàn bộ bài hát thành phiên bản hoàn hảo nhất:
     + "CHẠM SÂU TÂM TRẠNG": Tả cảnh ngụ tình, hình ảnh giàu chất thơ, không sáo rỗng, bám sát tiêu đề "${songTitle}".
     + "GIEO VẦN CHUẨN XÁC 100%": Mỗi khổ thơ phải ăn vần chân (AABB hoặc ABAB), vần lưng mượt mà, cuối câu điệp khúc buông thanh Bằng (ngang/huyền) ngân vang.
     + Giữ nguyên cấu trúc thẻ Suno AI: [Intro], [Verse 1], [Pre-Chorus], [Chorus], [Verse 2], [Bridge], [Outro].

Trả về kết quả ĐÚNG định dạng JSON sau (không kèm markdown \`\`\`json):
{
  "overallScore": 8.8,
  "scoreRating": "Tuyệt Tác Chạm Đáy Cảm Xúc",
  "scores": {
    "emotionalResonance": 9.0,
    "rhymeAndFlow": 8.7,
    "genreFit": 8.8,
    "creativeImagery": 8.9
  },
  "generalReview": "Đoạn văn nhận định tổng quan chuyên sâu từ Master Lyricist...",
  "weakPoints": [
    "Điểm yếu 1...",
    "Điểm yếu 2..."
  ],
  "strongPoints": [
    "Điểm sáng 1...",
    "Điểm sáng 2..."
  ],
  "improvements": [
    {
      "section": "[Chorus]",
      "original": "Câu gốc...",
      "improved": "Câu nâng cấp giàu xúc cảm và gieo vần khít khao...",
      "reason": "Giải thích vì sao câu mới chạm hơn..."
    }
  ],
  "polishedLyrics": "Toàn bộ bản lời bài hát hoàn chỉnh sau khi nâng cấp với vần điệu chuẩn xác và cảm xúc sâu lắng..."
}`;

            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: auditPrompt }] }],
                        generationConfig: { temperature: 0.82 }
                    })
                });

                const data = await response.json();
                if (data.error) {
                    throw new Error(data.error.message);
                }

                let aiText = data.candidates[0].content.parts[0].text;
                aiText = aiText.replace(/```json/gi, '').replace(/```/g, '').trim();
                const result = JSON.parse(aiText);
                currentAuditData = result;

                // Render điểm tổng quan
                if (auditOverallScore) auditOverallScore.innerText = Number(result.overallScore || 8.5).toFixed(1);
                if (auditScoreRating) auditScoreRating.innerText = result.scoreRating || 'Thẩm Định Thành Công';
                if (auditGeneralReview) auditGeneralReview.innerText = result.generalReview || '';

                // Render 4 thanh chỉ số
                const sc = result.scores || {};
                const setScore = (valEl, barEl, scoreVal) => {
                    const num = Number(scoreVal || 8.0);
                    if (valEl) valEl.innerText = num.toFixed(1) + '/10';
                    if (barEl) barEl.style.width = Math.min(100, Math.max(10, num * 10)) + '%';
                };
                setScore(scoreEmotional, barEmotional, sc.emotionalResonance);
                setScore(scoreRhyme, barRhyme, sc.rhymeAndFlow);
                setScore(scoreGenre, barGenre, sc.genreFit);
                setScore(scoreImagery, barImagery, sc.creativeImagery);

                // Render Weak points & Strong points
                if (auditWeakList) {
                    const weaks = Array.isArray(result.weakPoints) ? result.weakPoints : [];
                    auditWeakList.innerHTML = weaks.map(w => `<li>${w}</li>`).join('') || '<li>Không phát hiện câu từ sáo rỗng nghiêm trọng.</li>';
                }
                if (auditStrongList) {
                    const strongs = Array.isArray(result.strongPoints) ? result.strongPoints : [];
                    auditStrongList.innerHTML = strongs.map(s => `<li>${s}</li>`).join('') || '<li>Cốt truyện bài hát có định hướng tốt.</li>';
                }

                // Render Line improvements
                if (auditImprovementsList) {
                    const imps = Array.isArray(result.lineImprovements) ? result.lineImprovements : [];
                    if (imps.length > 0) {
                        auditImprovementsList.innerHTML = imps.map(imp => `
                            <div class="improvement-card">
                                <div class="imp-header">
                                    <span><i class="fas fa-bookmark"></i> ${imp.section || 'Đoạn nâng cấp'}</span>
                                    <span class="badge" style="background: rgba(46,213,115,0.15); color: #2ed573;">Nâng cấp chạm sâu</span>
                                </div>
                                <div class="imp-body">
                                    <div class="imp-orig"><strong>Câu gốc:</strong> "${imp.original || ''}"</div>
                                    <div class="imp-arrow"><i class="fas fa-arrow-down"></i></div>
                                    <div class="imp-upgraded"><strong>Gợi ý nâng cấp:</strong> "${imp.improved || ''}"</div>
                                    <div class="imp-reason"><i class="fas fa-info-circle"></i> ${imp.reason || ''}</div>
                                </div>
                            </div>
                        `).join('');
                    } else {
                        auditImprovementsList.innerHTML = '<p class="hint">Toàn bộ câu từ của bản gốc đã đạt độ chín muồi tốt.</p>';
                    }
                }

                // Render bản lời hoàn chỉnh sau nâng cấp
                if (auditPolishedLyrics) {
                    auditPolishedLyrics.value = result.polishedLyrics || rawLyrics;
                }

                // Hiển thị kết quả
                if (auditEmptyOutput) auditEmptyOutput.style.display = 'none';
                if (auditOutputContent) auditOutputContent.style.display = 'block';
                if (auditExportActions) auditExportActions.style.display = 'flex';

            } catch (err) {
                alert('Lỗi thẩm định ca từ: ' + err.message);
                console.error(err);
                if (auditEmptyOutput) auditEmptyOutput.style.display = 'flex';
            } finally {
                if (auditLoader) auditLoader.style.display = 'none';
            }
        });
    }

    // Sao chép toàn bộ lời đã nâng cấp
    const handleCopyPolishedLyrics = async () => {
        if (!auditPolishedLyrics || !auditPolishedLyrics.value.trim()) {
            alert('Chưa có lời bài hát đã nâng cấp để sao chép!');
            return;
        }
        try {
            await navigator.clipboard.writeText(auditPolishedLyrics.value.trim());
            alert('Đã sao chép toàn bộ lời bài hát đã nâng cấp thành công!');
        } catch (e) {
            auditPolishedLyrics.select();
            document.execCommand('copy');
            alert('Đã sao chép lời bài hát!');
        }
    };
    if (btnCopyAuditLyrics) btnCopyAuditLyrics.addEventListener('click', handleCopyPolishedLyrics);
    if (btnCopyPolishedLyrics) btnCopyPolishedLyrics.addEventListener('click', handleCopyPolishedLyrics);

    // Chuyển lời đã nâng cấp sang Tab 2 (Suno AI Studio)
    const handleSendAuditToSuno = () => {
        if (!auditPolishedLyrics || !auditPolishedLyrics.value.trim()) {
            alert('Chưa có lời bài hát đã nâng cấp để chuyển sang Tab Suno!');
            return;
        }
        if (outSunoLyrics) outSunoLyrics.value = auditPolishedLyrics.value.trim();
        if (auditSongTitle && auditSongTitle.value.trim()) {
            const cleanTitle = auditSongTitle.value.replace(/\(Bản Thô.*?\)/gi, '').trim();
            if (outSunoTitle) outSunoTitle.value = cleanTitle;
            if (sunoInputTitle) sunoInputTitle.value = cleanTitle;
        }
        // Chuyển tab sang Tab Suno
        const sunoTabBtn = document.querySelector('.tab-btn[data-tab="tab-suno"]');
        if (sunoTabBtn) sunoTabBtn.click();
        alert('Đã chuyển thành công lời bài hát đã nâng cấp sang Tab Suno AI Studio! Bạn có thể tạo nhạc ngay.');
    };
    if (btnSendAuditToSuno) btnSendAuditToSuno.addEventListener('click', handleSendAuditToSuno);
    if (btnSendToSunoBottom) btnSendToSunoBottom.addEventListener('click', handleSendAuditToSuno);

    // Xuất báo cáo thẩm định TXT
    if (btnExportAuditTxt) {
        btnExportAuditTxt.addEventListener('click', () => {
            if (!auditPolishedLyrics || !auditPolishedLyrics.value.trim()) {
                alert('Chưa có kết quả thẩm định để xuất file!');
                return;
            }
            const report = `============================================================
BÁO CÁO THẨM ĐỊNH & NÂNG CẤP CA TỪ CHUYÊN SÂU
TIÊU ĐỀ: ${auditSongTitle.value.trim() || 'Chưa đặt tiêu đề'}
THỂ LOẠI: ${auditGenreSelect.options[auditGenreSelect.selectedIndex].text}
CHỦ ĐỀ: ${auditTopic.value.trim() || 'N/A'}
ĐIỂM TỔNG QUAN: ${auditOverallScore.innerText} - ${auditScoreRating.innerText}
============================================================

1. NHẬN ĐỊNH TỔNG QUAN TỪ BẬC THẦY CA TỪ:
${auditGeneralReview.innerText}

2. CÁC ĐIỂM HẠN CHẾ CẦN KHẮC PHỤC (HỜI HỢT / SÁO RỖNG):
${(currentAuditData?.weakPoints || []).map((w, i) => `${i + 1}. ${w}`).join('\n')}

3. ĐIỂM SÁNG TRONG BẢN GỐC:
${(currentAuditData?.strongPoints || []).map((s, i) => `${i + 1}. ${s}`).join('\n')}

============================================================
4. TOÀN BỘ BẢN LỜI HOÀN CHỈNH ĐÃ ĐƯỢC NÂNG CẤP CHẠM ĐÁY TÂM CAN:
============================================================
${auditPolishedLyrics.value.trim()}
`;
            const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${auditSongTitle.value.trim() || 'Tham_Dinh'}_Bao_Cao_Ca_Tu.txt`;
            a.click();
            URL.revokeObjectURL(url);
        });
    }

    // Xóa & làm mới dữ liệu Tab 3
    if (btnResetAudit) {
        btnResetAudit.addEventListener('click', () => {
            if (confirm('Bạn có chắc chắn muốn xóa dữ liệu thẩm định trong Tab này không?')) {
                auditSongTitle.value = '';
                auditTopic.value = '';
                auditLyricsInput.value = '';
                updateAuditLyricsCount();
                if (auditPolishedLyrics) auditPolishedLyrics.value = '';
                if (auditOutputContent) auditOutputContent.style.display = 'none';
                if (auditExportActions) auditExportActions.style.display = 'none';
                if (auditLoader) auditLoader.style.display = 'none';
                if (auditEmptyOutput) auditEmptyOutput.style.display = 'flex';
                currentAuditData = null;
            }
        });
    }

    // Hàm reset sạch toàn bộ kết quả khi F5 hoặc tải lại trang
    function resetAllOutputs() {
        // Tab 1 (YouTube SEO)
        if (outTitle1) outTitle1.value = '';
        if (outTitle2) outTitle2.value = '';
        if (outTitle3) outTitle3.value = '';
        if (outTitle4) outTitle4.value = '';
        if (outTitle5) outTitle5.value = '';
        if (outTitle6) outTitle6.value = '';
        if (outTitle7) outTitle7.value = '';
        if (outDescription) outDescription.value = '';
        if (outTimestamps) outTimestamps.value = '';
        if (outHashtags) outHashtags.value = '';
        if (outTags) outTags.value = '';
        if (totalDurationEl) totalDurationEl.innerText = '00:00';
        updateAllTitleCounts();
        updateHashtagsCount();
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
