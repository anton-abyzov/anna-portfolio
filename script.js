// ============================================
// Anna Abyzova — Portfolio Script
// ============================================

(function() {
    'use strict';

    // ============================================
    // Birthday Detection (Feb 5, 6, 7)
    // ============================================
    const BIRTHDAY_MONTH = 1; // February (0-indexed)
    const BIRTHDAY_RANGE = [5, 6, 7]; // Active days

    function isBirthdayPeriod() {
        const now = new Date();
        return now.getMonth() === BIRTHDAY_MONTH && BIRTHDAY_RANGE.includes(now.getDate());
    }

    // ============================================
    // Birthday Canvas Confetti System
    // ============================================
    class BirthdayConfetti {
        constructor(canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.particles = [];
            this.running = false;
            this.resize();
            window.addEventListener('resize', () => this.resize());
        }

        resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }

        createParticle() {
            const colors = [
                '#ffd700', '#ffb347', '#ff6b6b', '#ffffff',
                '#ffc0cb', '#87ceeb', '#dda0dd', '#f0e68c'
            ];
            return {
                x: Math.random() * this.canvas.width,
                y: -20,
                size: Math.random() * 6 + 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                speedY: Math.random() * 2 + 1,
                speedX: (Math.random() - 0.5) * 2,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 8,
                opacity: 1,
                shape: Math.random() > 0.5 ? 'circle' : 'rect'
            };
        }

        start() {
            this.running = true;
            // Initial burst
            for (let i = 0; i < 80; i++) {
                const p = this.createParticle();
                p.y = Math.random() * this.canvas.height;
                this.particles.push(p);
            }
            this.animate();
        }

        stop() {
            this.running = false;
        }

        animate() {
            if (!this.running) return;

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Add new particles
            if (this.particles.length < 120 && Math.random() > 0.7) {
                this.particles.push(this.createParticle());
            }

            for (let i = this.particles.length - 1; i >= 0; i--) {
                const p = this.particles[i];

                p.y += p.speedY;
                p.x += p.speedX;
                p.rotation += p.rotationSpeed;
                p.speedX += (Math.random() - 0.5) * 0.1;

                // Gentle gravity
                p.speedY += 0.02;

                // Fade out near bottom
                if (p.y > this.canvas.height * 0.8) {
                    p.opacity -= 0.02;
                }

                // Remove dead particles
                if (p.y > this.canvas.height || p.opacity <= 0) {
                    this.particles.splice(i, 1);
                    continue;
                }

                this.ctx.save();
                this.ctx.globalAlpha = p.opacity;
                this.ctx.translate(p.x, p.y);
                this.ctx.rotate((p.rotation * Math.PI) / 180);

                if (p.shape === 'circle') {
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
                    this.ctx.fillStyle = p.color;
                    this.ctx.fill();
                } else {
                    this.ctx.fillStyle = p.color;
                    this.ctx.fillRect(-p.size, -p.size / 2, p.size * 2, p.size);
                }

                this.ctx.restore();
            }

            requestAnimationFrame(() => this.animate());
        }
    }

    // ============================================
    // Birthday Audio — Web Audio API Melodies
    // ============================================
    let audioCtx = null;

    function getAudioContext() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') audioCtx.resume();
        return audioCtx;
    }

    function playNote(ctx, freq, startTime, duration, volume, type) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = type || 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(volume || 0.12, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
    }

    // Magical chime — plays when overlay opens
    function playOpenChime() {
        try {
            var ctx = getAudioContext();
            var t = ctx.currentTime;
            // Ascending sparkle chime (C5 E5 G5 C6)
            playNote(ctx, 523.25, t, 0.5, 0.1, 'sine');
            playNote(ctx, 659.25, t + 0.12, 0.5, 0.1, 'sine');
            playNote(ctx, 783.99, t + 0.24, 0.5, 0.1, 'sine');
            playNote(ctx, 1046.5, t + 0.36, 0.8, 0.12, 'sine');
            // Soft shimmer pad
            playNote(ctx, 523.25, t + 0.1, 1.2, 0.04, 'triangle');
            playNote(ctx, 659.25, t + 0.1, 1.2, 0.04, 'triangle');
            playNote(ctx, 783.99, t + 0.1, 1.2, 0.04, 'triangle');
        } catch (e) {}
    }

    // Candle blow-out sound — a soft "whoosh"
    function playBlowSound() {
        try {
            var ctx = getAudioContext();
            var t = ctx.currentTime;
            // White noise burst for whoosh
            var bufferSize = ctx.sampleRate * 0.2;
            var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            var data = buffer.getChannelData(0);
            for (var i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3);
            }
            var source = ctx.createBufferSource();
            source.buffer = buffer;
            var gain = ctx.createGain();
            gain.gain.setValueAtTime(0.08, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
            var filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 1200;
            filter.Q.value = 0.5;
            source.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            source.start(t);
            // Tiny chime after whoosh
            playNote(ctx, 880 + Math.random() * 400, t + 0.05, 0.3, 0.06, 'sine');
        } catch (e) {}
    }

    // Happy Birthday melody snippet — plays on celebration
    function playCelebrationMelody() {
        try {
            var ctx = getAudioContext();
            var t = ctx.currentTime;
            // "Happy Birthday to you" melody (first line)
            var melody = [
                [261.63, 0.25], [261.63, 0.25], [293.66, 0.5], [261.63, 0.5],
                [349.23, 0.5], [329.63, 1.0],
                [261.63, 0.25], [261.63, 0.25], [293.66, 0.5], [261.63, 0.5],
                [392.00, 0.5], [349.23, 1.0]
            ];
            var offset = 0;
            melody.forEach(function(note) {
                playNote(ctx, note[0], t + offset, note[1] * 0.9, 0.1, 'sine');
                // Harmony
                playNote(ctx, note[0] * 1.5, t + offset, note[1] * 0.9, 0.03, 'triangle');
                offset += note[1] * 0.45;
            });
            // Sustained chord at end
            playNote(ctx, 261.63, t + offset, 2, 0.06, 'triangle');
            playNote(ctx, 329.63, t + offset, 2, 0.06, 'triangle');
            playNote(ctx, 392.00, t + offset, 2, 0.06, 'triangle');
        } catch (e) {}
    }

    // ============================================
    // Birthday Celebration — Interactive Candles
    // ============================================
    function initBirthday() {
        if (!isBirthdayPeriod()) return;

        const overlay = document.getElementById('birthdayOverlay');
        const banner = document.getElementById('birthdayBanner');
        const canvas = document.getElementById('birthdayCanvas');
        const hint = document.getElementById('birthdayHint');
        const title = document.getElementById('birthdayTitle');
        const subtitle = document.getElementById('birthdaySubtitle');
        const candles = document.querySelectorAll('.candle');

        if (!overlay || !banner || !canvas) return;

        // Show banner immediately — non-intrusive
        banner.style.display = 'flex';
        document.body.classList.add('birthday-active');

        // Clicking the banner opens the candle experience
        banner.style.cursor = 'pointer';
        banner.addEventListener('click', openCelebration);

        let confetti = null;
        let candlesBlown = 0;
        const totalCandles = candles.length;

        function openCelebration() {
            // Reset candles if reopened
            candlesBlown = 0;
            candles.forEach(c => c.classList.remove('blown'));
            title.classList.remove('visible');
            subtitle.classList.remove('visible');
            hint.classList.remove('hidden');
            hint.textContent = 'Tap the candles to make a wish';

            overlay.style.display = 'flex';
            overlay.classList.remove('hiding');
            document.body.style.overflow = 'hidden';

            if (!confetti) {
                confetti = new BirthdayConfetti(canvas);
            }

            // Play magical open chime
            playOpenChime();
        }

        // Click a candle to blow it out
        candles.forEach(candle => {
            candle.addEventListener('click', () => {
                if (candle.classList.contains('blown')) return;

                candle.classList.add('blown');
                candlesBlown++;

                // Play blow-out sound
                playBlowSound();

                // Update hint with remaining count
                const remaining = totalCandles - candlesBlown;
                if (remaining > 0) {
                    hint.textContent = remaining + ' candle' + (remaining > 1 ? 's' : '') + ' left...';
                }

                // All candles blown — celebrate!
                if (candlesBlown === totalCandles) {
                    hint.classList.add('hidden');

                    // Start confetti burst
                    confetti.start();

                    // Play celebration melody
                    setTimeout(() => playCelebrationMelody(), 200);

                    // Show title and subtitle
                    setTimeout(() => {
                        title.classList.add('visible');
                        subtitle.classList.add('visible');
                    }, 400);

                    // Auto-dismiss after celebration
                    setTimeout(() => {
                        dismissOverlay();
                    }, 5000);
                }
            });
        });

        // Dismiss overlay
        function dismissOverlay() {
            overlay.classList.add('hiding');
            document.body.style.overflow = '';

            setTimeout(() => {
                overlay.style.display = 'none';
                if (confetti) confetti.stop();
            }, 1200);
        }

        // Escape to close overlay
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay.style.display === 'flex') {
                dismissOverlay();
            }
        });
    }

    // ============================================
    // Sidebar Navigation
    // ============================================
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebarLinks = document.querySelectorAll('.sidebar-link');

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('expanded');
            document.body.classList.toggle('sidebar-expanded');
        });
    }

    // Close sidebar on mobile link click
    sidebarLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 768) {
                sidebar.classList.remove('expanded');
                document.body.classList.remove('sidebar-expanded');
            }
        });
    });

    // Active link on scroll
    window.addEventListener('scroll', () => {
        let current = '';
        const sections = document.querySelectorAll('section');

        sections.forEach(section => {
            const top = section.offsetTop;
            if (window.pageYOffset >= top - 200) {
                current = section.getAttribute('id');
            }
        });

        sidebarLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === current) {
                link.classList.add('active');
            }
        });
    });

    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ============================================
    // Scroll Progress Bar
    // ============================================
    const progressBar = document.createElement('div');
    progressBar.id = 'scrollProgress';
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
        const winHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.scrollY / winHeight) * 100;
        progressBar.style.width = scrolled + '%';
    });

    // ============================================
    // Scroll Reveal (IntersectionObserver)
    // ============================================
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // ============================================
    // Video Modal
    // ============================================
    const videoModal = document.getElementById('videoModal');
    const videoFrame = document.getElementById('videoFrame');
    const modalTitle = document.getElementById('modalTitle');
    const modalClose = document.querySelector('.modal-close');
    const modalOverlay = document.querySelector('.modal-overlay');

    document.querySelectorAll('[data-video]').forEach(card => {
        card.addEventListener('click', () => {
            const videoId = card.getAttribute('data-video');
            const title = card.querySelector('h3')?.textContent || 'Performance';
            if (videoId) openVideoModal(videoId, title);
        });
    });

    function openVideoModal(videoId, title) {
        videoFrame.src = 'https://www.youtube.com/embed/' + videoId + '?autoplay=1&rel=0&modestbranding=1';
        modalTitle.textContent = title;
        videoModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeVideoModal() {
        videoFrame.src = '';
        videoModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    if (modalClose) modalClose.addEventListener('click', closeVideoModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeVideoModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && videoModal.classList.contains('active')) {
            closeVideoModal();
        }
    });

    // ============================================
    // Testimonials Carousel
    // ============================================
    let currentTestimonial = 0;
    const testimonials = document.querySelectorAll('.testimonial');
    const navDots = document.querySelectorAll('.nav-dot');

    window.showTestimonial = function(index) {
        testimonials.forEach(t => t.classList.remove('active'));
        navDots.forEach(d => d.classList.remove('active'));
        testimonials[index].classList.add('active');
        navDots[index].classList.add('active');
        currentTestimonial = index;
    };

    setInterval(() => {
        currentTestimonial = (currentTestimonial + 1) % testimonials.length;
        window.showTestimonial(currentTestimonial);
    }, 6000);

    // ============================================
    // Contact Form
    // ============================================
    const contactForm = document.querySelector('.fun-form');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = contactForm.querySelector('#name').value.trim();
            const email = contactForm.querySelector('#email').value.trim();
            const service = contactForm.querySelector('#service').value;
            const message = contactForm.querySelector('#message').value.trim();

            if (!name || !email || !service || !message) {
                showNotification('Please fill in all fields.');
                return;
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showNotification('Please enter a valid email address.');
                return;
            }

            const serviceNames = {
                'math': 'Math Tutoring',
                'science': 'Science Tutoring',
                'language': 'Language Learning',
                'piano': 'Piano Lessons',
                'other': 'General Inquiry'
            };

            const serviceName = serviceNames[service] || 'General Inquiry';
            const subject = encodeURIComponent(serviceName + ' - Message from ' + name);
            const body = encodeURIComponent(
                'Hi Anna,\n\n' +
                'My name is ' + name + ' and I\'m interested in: ' + serviceName + '\n\n' +
                message + '\n\n' +
                'Best regards,\n' + name
            );

            window.location.href = 'mailto:abyzovann@icloud.com?subject=' + subject + '&body=' + body;
            showNotification('Email client opened. Don\'t forget to send!');

            // Reset form
            contactForm.querySelectorAll('input, select, textarea').forEach(el => {
                el.value = '';
            });
        });
    }

    // ============================================
    // Notification System
    // ============================================
    function showNotification(message) {
        document.querySelectorAll('.fun-notification').forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = 'fun-notification';

        const content = document.createElement('div');
        content.className = 'notification-content';
        content.textContent = message;

        const closeBtn = document.createElement('button');
        closeBtn.className = 'notification-close';
        closeBtn.textContent = '\u00d7';
        closeBtn.onclick = () => removeNotification(notification);

        notification.appendChild(content);
        notification.appendChild(closeBtn);
        document.body.appendChild(notification);

        setTimeout(() => removeNotification(notification), 5000);
    }

    function removeNotification(el) {
        if (el && el.parentNode) {
            el.style.opacity = '0';
            el.style.transform = 'translateX(100%)';
            el.style.transition = 'all 0.3s ease';
            setTimeout(() => {
                if (el.parentNode) el.parentNode.removeChild(el);
            }, 300);
        }
    }

    // ============================================
    // Music Library Data
    // ============================================
    const musicLibrary = [
        {
            videoId: 'ZVZhNhyyErM',
            title: "Tchaikovsky's Sentimental Waltz",
            composer: 'Pyotr Ilyich Tchaikovsky',
            era: 'Romantic',
            period: '1876',
            difficulty: 'Advanced',
            duration: '5:38',
            description: 'A beautiful and sentimental waltz showcasing Tchaikovsky\'s lyrical melodic style.',
            tags: ['Classical', 'Waltz', 'Romantic Era'],
            featured: true
        },
        {
            videoId: 'LyNPFwqxKwA',
            title: 'Rachmaninoff Musical Moment',
            composer: 'Sergei Rachmaninoff',
            era: 'Romantic',
            period: 'Op. 16',
            difficulty: 'Virtuoso',
            duration: '4:22',
            description: 'One of Rachmaninoff\'s exquisite Moments Musicaux, requiring advanced technique and musical sensitivity.',
            tags: ['Romantic', 'Russian', 'Technical'],
            featured: true
        },
        {
            videoId: 'DS6IOTnFQGA',
            title: 'Chopin Nocturne in C# Minor',
            composer: 'Frédéric Chopin',
            era: 'Romantic',
            period: '1830',
            difficulty: 'Intermediate',
            duration: '3:45',
            description: 'A hauntingly beautiful nocturne demonstrating Chopin\'s mastery of lyrical expression.',
            tags: ['Romantic', 'Nocturne', 'Lyrical'],
            featured: false
        },
        {
            videoId: 'cFDlzbXOsf0',
            title: 'Summer Concert 2025',
            composer: 'Various Artists',
            era: 'Contemporary',
            period: '2025',
            difficulty: 'Varied',
            duration: '3:12',
            description: 'Live performance from the Dozen Beats Fiesta summer concert series.',
            tags: ['Concert', 'Live', 'Contemporary'],
            featured: false
        },
        {
            videoId: 'Zseu7UEHduY',
            title: 'Sunny Isles Live Show',
            composer: 'With Maestro Michael',
            era: 'Contemporary',
            period: '2024',
            difficulty: 'Advanced',
            duration: '4:50',
            description: 'Collaborative performance with Maestro Michael at the Sunny Isles venue.',
            tags: ['Live', 'Collaboration', 'Concert'],
            featured: false
        },
        {
            videoId: 'BFF_hzafEuo',
            title: 'Bach: Air on G String',
            composer: 'Johann Sebastian Bach',
            era: 'Baroque',
            period: '1723',
            difficulty: 'Intermediate',
            duration: '5:15',
            description: 'A timeless Baroque masterpiece, arranged for solo piano with grace and elegance.',
            tags: ['Baroque', 'Timeless', 'Transcription'],
            featured: false
        }
    ];

    // Music Player (YouTube IFrame API)
    // ============================================
    const playlist = [];
    let playerState = {
        currentIndex: -1,
        isPlaying: false,
        ytPlayer: null,
        ytReady: false,
        progressTimer: null,
        loadingTrack: false,
        queue: [] // Playlist queue
    };

    // Build playlist from musicLibrary
    musicLibrary.forEach(track => {
        playlist.push({
            videoId: track.videoId,
            title: track.title,
            composer: track.composer,
            era: track.era,
            duration: track.duration,
            description: track.description,
            tags: track.tags,
            featured: track.featured
        });
    });

    const musicPlayerEl = document.getElementById('musicPlayer');
    const musicTitle = document.getElementById('musicTitle');
    const musicComposer = document.getElementById('musicComposer');
    const musicThumbImg = document.getElementById('musicThumbImg');
    const musicPlayBtn = document.getElementById('musicPlayBtn');
    const musicPrev = document.getElementById('musicPrev');
    const musicNext = document.getElementById('musicNext');
    const musicClose = document.getElementById('musicClose');
    const musicProgressFill = document.getElementById('musicProgressFill');
    const musicProgressInput = document.getElementById('musicProgressInput');
    const musicTime = document.getElementById('musicTime');
    const iconPlay = musicPlayBtn.querySelector('.icon-play');
    const iconPause = musicPlayBtn.querySelector('.icon-pause');

    // YouTube IFrame API ready callback
    window.onYouTubeIframeAPIReady = function() {
        playerState.ytPlayer = new YT.Player('ytPlayer', {
            height: '1',
            width: '1',
            playerVars: {
                autoplay: 0,
                controls: 0,
                disablekb: 1,
                fs: 0,
                modestbranding: 1,
                rel: 0,
                origin: window.location.origin
            },
            events: {
                onReady: function() {
                    playerState.ytReady = true;
                },
                onStateChange: function(event) {
                    if (event.data === YT.PlayerState.PLAYING) {
                        playerState.loadingTrack = false;
                        playerState.isPlaying = true;
                        updatePlayIcon();
                        startProgressTimer();
                    } else if (event.data === YT.PlayerState.PAUSED) {
                        // Ignore PAUSED from previous video during track switch
                        if (playerState.loadingTrack) return;
                        playerState.isPlaying = false;
                        updatePlayIcon();
                        stopProgressTimer();
                    } else if (event.data === YT.PlayerState.ENDED) {
                        if (playerState.loadingTrack) return;
                        playNext();
                    }
                }
            }
        });
    };

    function playTrack(index) {
        if (index < 0 || index >= playlist.length) return;
        if (!playerState.ytReady) return;

        playerState.currentIndex = index;
        const track = playlist[index];

        // Update UI
        musicTitle.textContent = track.title;
        musicComposer.textContent = track.composer;
        musicThumbImg.src = 'https://img.youtube.com/vi/' + track.videoId + '/mqdefault.jpg';
        musicThumbImg.alt = track.title;
        musicPlayerEl.classList.add('visible');

        // Update card states
        document.querySelectorAll('.performance-card').forEach(c => c.classList.remove('now-playing'));
        document.querySelectorAll('.listen-btn').forEach(b => b.classList.remove('playing'));

        const activeBtn = document.querySelector('[data-listen="' + track.videoId + '"]');
        if (activeBtn) {
            activeBtn.classList.add('playing');
            activeBtn.closest('.performance-card')?.classList.add('now-playing');
        }

        // Load and play — set flag to ignore stale state changes from previous video
        playerState.loadingTrack = true;
        playerState.ytPlayer.loadVideoById(track.videoId);
        playerState.isPlaying = true;
        updatePlayIcon();
        startProgressTimer();
    }

    function togglePlay() {
        if (!playerState.ytReady || playerState.currentIndex === -1) return;

        if (playerState.isPlaying) {
            playerState.ytPlayer.pauseVideo();
        } else {
            playerState.ytPlayer.playVideo();
        }
    }

    function playNext() {
        if (playlist.length === 0) return;
        const next = (playerState.currentIndex + 1) % playlist.length;
        playTrack(next);
    }

    function playPrev() {
        if (playlist.length === 0) return;
        // If more than 3 seconds in, restart current track
        if (playerState.ytReady && playerState.ytPlayer.getCurrentTime && playerState.ytPlayer.getCurrentTime() > 3) {
            playerState.ytPlayer.seekTo(0);
            return;
        }
        const prev = (playerState.currentIndex - 1 + playlist.length) % playlist.length;
        playTrack(prev);
    }

    function closePlayer() {
        if (playerState.ytReady && playerState.ytPlayer.stopVideo) {
            playerState.ytPlayer.stopVideo();
        }
        playerState.isPlaying = false;
        playerState.currentIndex = -1;
        musicPlayerEl.classList.remove('visible');
        document.querySelectorAll('.performance-card').forEach(c => c.classList.remove('now-playing'));
        document.querySelectorAll('.listen-btn').forEach(b => b.classList.remove('playing'));
        stopProgressTimer();
        musicProgressFill.style.width = '0%';
        musicTime.textContent = '0:00';
        updatePlayIcon();
    }

    function updatePlayIcon() {
        var playing = playerState.isPlaying;
        // Cross-check with actual YouTube player state for accuracy
        if (playerState.ytReady && playerState.ytPlayer && playerState.ytPlayer.getPlayerState) {
            var state = playerState.ytPlayer.getPlayerState();
            playing = (state === 1 /* PLAYING */ || state === 3 /* BUFFERING */);
            playerState.isPlaying = playing;
        }
        if (playing) {
            iconPlay.style.display = 'none';
            iconPause.style.display = 'block';
        } else {
            iconPlay.style.display = 'block';
            iconPause.style.display = 'none';
        }
    }

    function formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return m + ':' + (s < 10 ? '0' : '') + s;
    }

    function startProgressTimer() {
        stopProgressTimer();
        playerState.progressTimer = setInterval(updateProgress, 500);
    }

    function stopProgressTimer() {
        if (playerState.progressTimer) {
            clearInterval(playerState.progressTimer);
            playerState.progressTimer = null;
        }
    }

    function updateProgress() {
        if (!playerState.ytReady || !playerState.ytPlayer.getCurrentTime) return;

        var current = playerState.ytPlayer.getCurrentTime() || 0;
        var duration = playerState.ytPlayer.getDuration() || 0;

        if (duration > 0) {
            var pct = (current / duration) * 100;
            musicProgressFill.style.width = pct + '%';
            musicProgressInput.value = pct;
            musicTime.textContent = formatTime(current) + ' / ' + formatTime(duration);
        }

        // Self-correct icon state
        updatePlayIcon();
    }

    // Seek via progress bar
    musicProgressInput.addEventListener('input', function() {
        if (!playerState.ytReady || !playerState.ytPlayer.getDuration) return;
        var duration = playerState.ytPlayer.getDuration() || 0;
        if (duration > 0) {
            var seekTo = (this.value / 100) * duration;
            playerState.ytPlayer.seekTo(seekTo, true);
            musicProgressFill.style.width = this.value + '%';
        }
    });

    // Controls
    musicPlayBtn.addEventListener('click', togglePlay);
    musicNext.addEventListener('click', playNext);
    musicPrev.addEventListener('click', playPrev);
    musicClose.addEventListener('click', closePlayer);

    // Listen buttons — stop propagation so video modal doesn't open
    document.querySelectorAll('.listen-btn').forEach((btn, i) => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();

            // If this track is already playing, toggle play/pause
            if (playerState.currentIndex === i && playerState.isPlaying) {
                togglePlay();
                return;
            }
            playTrack(i);
        });
    });

    // Play All button
    var playAllBtn = document.getElementById('playAllBtn');
    if (playAllBtn) {
        playAllBtn.addEventListener('click', function() {
            if (playlist.length > 0) playTrack(0);
        });
    }

    // Keyboard: space to toggle, arrows to skip
    document.addEventListener('keydown', function(e) {
        if (playerState.currentIndex === -1) return;
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

        if (e.code === 'Space' && !videoModal.classList.contains('active')) {
            e.preventDefault();
            togglePlay();
        }
    });

    // ============================================
    // Music Library Modal
    // ============================================
    const libraryModal = document.getElementById('libraryModal');
    const libraryGrid = document.getElementById('libraryGrid');
    const libraryToggleBtn = document.getElementById('libraryToggleBtn');
    const librarySearch = document.getElementById('librarySearch');
    const filterTabs = document.querySelectorAll('.filter-tab');

    let currentFilter = 'all';
    let searchQuery = '';

    function renderLibraryGrid(tracks) {
        libraryGrid.innerHTML = tracks.map((track, index) => `
            <div class="library-card" data-index="${index}" data-era="${track.era.toLowerCase()}" data-featured="${track.featured}">
                <div class="library-card-thumb">
                    <img src="https://img.youtube.com/vi/${track.videoId}/mqdefault.jpg" alt="${track.title}">
                    <div class="library-card-play-overlay">
                        <div class="library-card-play-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <polygon points="5 3 19 12 5 21 5 3"/>
                            </svg>
                        </div>
                    </div>
                </div>
                <div class="library-card-info">
                    <h4 class="library-card-title">${track.title}</h4>
                    <p class="library-card-composer">${track.composer}</p>
                    <div class="library-card-meta">
                        <span class="meta-badge">${track.era}</span>
                        <span class="meta-badge">${track.difficulty}</span>
                        <span class="meta-badge">${track.duration}</span>
                    </div>
                </div>
            </div>
        `).join('');

        // Add click handlers
        document.querySelectorAll('.library-card').forEach(card => {
            card.addEventListener('click', () => {
                const index = parseInt(card.dataset.index);
                playTrack(index);
                closeLibraryModal();
            });
        });
    }

    function filterLibrary() {
        let filtered = playlist;

        // Apply category filter
        if (currentFilter === 'featured') {
            filtered = filtered.filter(t => t.featured);
        } else if (currentFilter !== 'all') {
            filtered = filtered.filter(t => t.era.toLowerCase() === currentFilter);
        }

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(t =>
                t.title.toLowerCase().includes(query) ||
                t.composer.toLowerCase().includes(query) ||
                t.tags.some(tag => tag.toLowerCase().includes(query))
            );
        }

        renderLibraryGrid(filtered);
    }

    function openLibraryModal() {
        libraryModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        filterLibrary();
    }

    function closeLibraryModal() {
        libraryModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    // Event listeners
    if (libraryToggleBtn) {
        libraryToggleBtn.addEventListener('click', openLibraryModal);
    }

    const libraryModalClose = document.querySelector('.library-modal .modal-close');
    const libraryModalOverlay = document.querySelector('.library-modal .modal-overlay');

    if (libraryModalClose) {
        libraryModalClose.addEventListener('click', closeLibraryModal);
    }

    if (libraryModalOverlay) {
        libraryModalOverlay.addEventListener('click', closeLibraryModal);
    }

    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.dataset.filter;
            filterLibrary();
        });
    });

    if (librarySearch) {
        librarySearch.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            filterLibrary();
        });
    }

    // Escape key handler for library modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && libraryModal && libraryModal.classList.contains('active')) {
            closeLibraryModal();
        }
    });

    // ============================================
    // Queue Management
    // ============================================
    const queuePanel = document.getElementById('queuePanel');
    const queueList = document.getElementById('queueList');
    const queueToggleBtn = document.getElementById('queueToggleBtn');
    const queueClearBtn = document.getElementById('queueClearBtn');
    const repeatBtn = document.getElementById('repeatBtn');
    const shuffleBtn = document.getElementById('shuffleBtn');

    // Extend playerState
    playerState.queue = [];
    playerState.repeatMode = 'off'; // 'off' | 'all' | 'one'
    playerState.shuffleEnabled = false;

    function addToQueue(trackIndex) {
        if (!playerState.queue.includes(trackIndex)) {
            playerState.queue.push(trackIndex);
            renderQueue();
            updateQueueCount();
        }
    }

    function removeFromQueue(position) {
        playerState.queue.splice(position, 1);
        renderQueue();
        updateQueueCount();
    }

    function clearQueue() {
        playerState.queue = [];
        renderQueue();
        updateQueueCount();
    }

    function renderQueue() {
        if (!queueList) return;

        queueList.innerHTML = playerState.queue.map((trackIndex, queuePosition) => {
            const track = playlist[trackIndex];
            const isCurrent = trackIndex === playerState.currentIndex;
            return `
                <div class="queue-item ${isCurrent ? 'current' : ''}" data-position="${queuePosition}" data-track="${trackIndex}">
                    <span class="queue-item-drag">☰</span>
                    <img class="queue-item-thumb" src="https://img.youtube.com/vi/${track.videoId}/default.jpg" alt="">
                    <div class="queue-item-info">
                        <div class="queue-item-title">${track.title}</div>
                        <div class="queue-item-composer">${track.composer}</div>
                    </div>
                    <button class="queue-item-remove" data-remove="${queuePosition}">✕</button>
                </div>
            `;
        }).join('');

        // Click handlers
        document.querySelectorAll('.queue-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.queue-item-remove')) {
                    const trackIndex = parseInt(item.dataset.track);
                    playTrack(trackIndex);
                }
            });
        });

        document.querySelectorAll('.queue-item-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                removeFromQueue(parseInt(btn.dataset.remove));
            });
        });
    }

    function updateQueueCount() {
        if (queueToggleBtn) {
            const countSpan = queueToggleBtn.querySelector('span');
            if (countSpan) {
                countSpan.textContent = `Queue (${playerState.queue.length})`;
            }
        }
    }

    function toggleQueue() {
        if (queuePanel) {
            queuePanel.classList.toggle('visible');
        }
    }

    function cycleRepeatMode() {
        const modes = ['off', 'all', 'one'];
        const currentIndex = modes.indexOf(playerState.repeatMode);
        playerState.repeatMode = modes[(currentIndex + 1) % modes.length];
        updateRepeatButton();
    }

    function updateRepeatButton() {
        if (!repeatBtn) return;

        const labels = {
            'off': 'Repeat: Off',
            'all': 'Repeat: All',
            'one': 'Repeat: One'
        };

        const labelSpan = repeatBtn.querySelector('span');
        if (labelSpan) {
            labelSpan.textContent = labels[playerState.repeatMode];
        }

        repeatBtn.classList.toggle('active', playerState.repeatMode !== 'off');
        repeatBtn.dataset.mode = playerState.repeatMode;
    }

    function toggleShuffle() {
        playerState.shuffleEnabled = !playerState.shuffleEnabled;

        if (shuffleBtn) {
            shuffleBtn.classList.toggle('active', playerState.shuffleEnabled);
            const labelSpan = shuffleBtn.querySelector('span');
            if (labelSpan) {
                labelSpan.textContent = playerState.shuffleEnabled ? 'Shuffle: On' : 'Shuffle: Off';
            }
        }
    }

    // Modified playNext to respect queue and repeat
    function playNextWithQueue() {
        // If repeat one, restart current
        if (playerState.repeatMode === 'one') {
            if (playerState.ytPlayer && playerState.ytPlayer.seekTo) {
                playerState.ytPlayer.seekTo(0);
                playerState.ytPlayer.playVideo();
            }
            return;
        }

        // Check queue first
        if (playerState.queue.length > 0) {
            const nextIndex = playerState.queue.shift();
            playTrack(nextIndex);
            renderQueue();
            updateQueueCount();
            return;
        }

        // No queue, check shuffle
        if (playerState.shuffleEnabled) {
            const randomIndex = Math.floor(Math.random() * playlist.length);
            playTrack(randomIndex);
            return;
        }

        // Normal next with repeat all
        const next = (playerState.currentIndex + 1) % playlist.length;
        if (next === 0 && playerState.repeatMode === 'off') {
            // End of playlist, no repeat
            closePlayer();
        } else {
            playTrack(next);
        }
    }

    // Override the existing playNext function in the YT player state change handler
    // We'll need to update the onStateChange callback
    const originalOnStateChange = function(event) {
        if (event.data === YT.PlayerState.PLAYING) {
            playerState.loadingTrack = false;
            playerState.isPlaying = true;
            updatePlayIcon();
            startProgressTimer();
        } else if (event.data === YT.PlayerState.PAUSED) {
            if (playerState.loadingTrack) return;
            playerState.isPlaying = false;
            updatePlayIcon();
            stopProgressTimer();
        } else if (event.data === YT.PlayerState.ENDED) {
            if (playerState.loadingTrack) return;
            playNextWithQueue(); // Use queue-aware next
        }
    };

    // Event listeners
    if (queueToggleBtn) {
        queueToggleBtn.addEventListener('click', toggleQueue);
    }

    if (queueClearBtn) {
        queueClearBtn.addEventListener('click', clearQueue);
    }

    if (repeatBtn) {
        repeatBtn.addEventListener('click', cycleRepeatMode);
    }

    if (shuffleBtn) {
        shuffleBtn.addEventListener('click', toggleShuffle);
    }

    // ============================================
    // Initialize
    // ============================================
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
        initBirthday();
    });

})();
