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
    // Cursor Glow Effect (Apple-style)
    // ============================================
    const cursorGlow = document.createElement('div');
    cursorGlow.style.cssText = `
        position: fixed;
        width: 400px;
        height: 400px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(6,182,212,0.06) 0%, rgba(236,72,153,0.03) 40%, transparent 70%);
        pointer-events: none;
        z-index: 0;
        transform: translate(-50%, -50%);
        transition: opacity 0.3s ease;
        opacity: 0;
    `;
    document.body.appendChild(cursorGlow);

    let glowX = 0, glowY = 0, curX = 0, curY = 0;
    document.addEventListener('mousemove', (e) => {
        glowX = e.clientX;
        glowY = e.clientY;
        cursorGlow.style.opacity = '1';
    });

    document.addEventListener('mouseleave', () => {
        cursorGlow.style.opacity = '0';
    });

    function animateGlow() {
        curX += (glowX - curX) * 0.08;
        curY += (glowY - curY) * 0.08;
        cursorGlow.style.left = curX + 'px';
        cursorGlow.style.top = curY + 'px';
        requestAnimationFrame(animateGlow);
    }
    animateGlow();

    // ============================================
    // Floating Sparkle Particles (Hero Section)
    // ============================================
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        const sparkleContainer = document.createElement('div');
        sparkleContainer.style.cssText = `
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            pointer-events: none; z-index: 1; overflow: hidden;
        `;
        heroSection.appendChild(sparkleContainer);

        function createSparkle() {
            const spark = document.createElement('div');
            const size = Math.random() * 4 + 2;
            const colors = ['#06b6d4', '#ec4899', '#f59e0b', '#8b5cf6'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            const startX = Math.random() * 100;
            const duration = Math.random() * 8 + 6;
            const delay = Math.random() * 4;

            spark.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                border-radius: 50%;
                left: ${startX}%;
                bottom: -10px;
                opacity: 0;
                box-shadow: 0 0 ${size * 2}px ${color}40;
                animation: sparkleRise ${duration}s ${delay}s ease-in-out infinite;
            `;
            sparkleContainer.appendChild(spark);
        }

        for (let i = 0; i < 15; i++) {
            createSparkle();
        }
    }

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
    // Music Library Data (Anna's Performances)
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

    // ============================================
    // Chill-out Library Data (Background Music)
    // ============================================
    const chilloutCategories = {
        lofi: { label: 'Lofi Beats', icon: '\u{1F3B5}', description: 'Chill beats to study/relax to' },
        focus: { label: 'Deep Focus', icon: '\u{1F9E0}', description: 'Concentration & productivity music' },
        relaxing: { label: 'Relaxing', icon: '\u{1F33F}', description: 'Stress relief & ambient music' },
        nature: { label: 'Nature Sounds', icon: '\u{1F333}', description: 'Ambient environmental sounds' },
        classical: { label: 'Classical', icon: '\u{1F3B9}', description: 'Timeless classical compositions' },
        frequencies: { label: 'Frequencies', icon: '\u{1F300}', description: 'Binaural beats & healing tones' }
    };

    const chilloutLibrary = [
        // Lofi Beats
        { id: 'lofi-1', videoId: 'jfKfPfyJRdk', title: 'lofi hip hop radio - beats to relax/study to', channel: 'Lofi Girl', duration: 'LIVE', category: 'lofi', isLive: true, views: '41K watching' },
        { id: 'lofi-2', videoId: 'rUxyKA_-grg', title: 'lofi hip hop radio - beats to sleep/chill to', channel: 'Lofi Girl', duration: 'LIVE', category: 'lofi', isLive: true, views: '15K watching' },
        { id: 'lofi-3', videoId: '5yx6BWlEVcY', title: 'Chillhop Radio - jazzy & lofi hip hop beats', channel: 'Chillhop Music', duration: 'LIVE', category: 'lofi', isLive: true, views: '8K watching' },
        { id: 'lofi-4', videoId: 'lP26UCnoH9s', title: 'Coffee Shop Radio - lofi & jazzy beats', channel: 'STEEZYASFUCK', duration: 'LIVE', category: 'lofi', isLive: true, views: '5K watching' },
        // Deep Focus
        { id: 'focus-1', videoId: 'lTRiuFIWV54', title: 'Deep Focus Music To Improve Concentration', channel: 'Greenred Productions', duration: '11:54:56', category: 'focus', isLive: false, views: '25M' },
        { id: 'focus-2', videoId: 'sjkrrmBnpGE', title: '4 Hours of Ambient Study Music', channel: 'Quiet Quest', duration: '4:00:00', category: 'focus', isLive: false, views: '12M' },
        { id: 'focus-3', videoId: 'oPVte6aMprI', title: 'Productive Morning - Study Music', channel: 'The Soul of Wind', duration: '3:28:15', category: 'focus', isLive: false, views: '8M' },
        { id: 'focus-4', videoId: 'WPni755-Krg', title: 'Brain Power - Focus Music', channel: 'Yellow Brick Cinema', duration: '3:00:12', category: 'focus', isLive: false, views: '45M' },
        // Relaxing
        { id: 'relax-1', videoId: '1fueZCTYkpA', title: 'Relaxing Sleep Music + Rain Sounds', channel: 'Soothing Relaxation', duration: '8:00:00', category: 'relaxing', isLive: false, views: '150M' },
        { id: 'relax-2', videoId: '77ZozI0rw7w', title: 'Peaceful Piano & Soft Rain', channel: 'OCB Relax Music', duration: '3:00:00', category: 'relaxing', isLive: false, views: '22M' },
        { id: 'relax-3', videoId: 'hlWiI4xVXKY', title: 'Beautiful Relaxing Music for Stress Relief', channel: 'Soothing Relaxation', duration: '3:17:42', category: 'relaxing', isLive: false, views: '85M' },
        { id: 'relax-4', videoId: '9Q634rbsypE', title: 'Calm Piano Music 24/7', channel: 'Relaxing Music', duration: 'LIVE', category: 'relaxing', isLive: true, views: '2.1M' },
        // Nature Sounds
        { id: 'nature-1', videoId: 'WHPEKLQID4U', title: 'Relaxing Ocean Waves', channel: 'Relaxing White Noise', duration: '10:00:00', category: 'nature', isLive: false, views: '87M' },
        { id: 'nature-2', videoId: 'xNN7iTA57jM', title: 'Forest Sounds - Birds Singing', channel: 'Nature Sounds', duration: '8:00:00', category: 'nature', isLive: false, views: '35M' },
        { id: 'nature-3', videoId: 'q76bMs-NwRk', title: 'Rain Sounds for Sleeping', channel: 'Rain Sounds', duration: '10:00:00', category: 'nature', isLive: false, views: '120M' },
        { id: 'nature-4', videoId: 'nDq6TstdEi8', title: 'Thunderstorm Sounds for Sleep', channel: 'The Relaxed Guy', duration: '8:00:00', category: 'nature', isLive: false, views: '56M' },
        // Classical
        { id: 'classical-1', videoId: '4Tr0otuiQuU', title: 'Beethoven - Moonlight Sonata (Full)', channel: 'HALIDONMUSIC', duration: '15:03', category: 'classical', isLive: false, views: '250M' },
        { id: 'classical-2', videoId: 'Rb0UmrCXxVA', title: 'Mozart - Classical Music for Brain Power', channel: 'HALIDONMUSIC', duration: '3:04:46', category: 'classical', isLive: false, views: '45M' },
        { id: 'classical-3', videoId: 'WJ8RVjm49hE', title: 'Chopin - Nocturnes (Complete)', channel: 'Classical Music Only', duration: '1:55:38', category: 'classical', isLive: false, views: '18M' },
        { id: 'classical-4', videoId: '1prweT95Mo0', title: 'Bach - Cello Suite No. 1', channel: 'Yo-Yo Ma', duration: '2:41:09', category: 'classical', isLive: false, views: '62M' },
        { id: 'classical-5', videoId: 'CvFH_6DNRCY', title: 'Debussy - Clair de Lune', channel: 'Rousseau', duration: '5:14', category: 'classical', isLive: false, views: '85M' },
        { id: 'classical-6', videoId: 'GRxofEmo3HA', title: 'Vivaldi - The Four Seasons', channel: 'HALIDONMUSIC', duration: '42:35', category: 'classical', isLive: false, views: '180M' },
        // Frequencies
        { id: 'freq-1', videoId: 'NPVX75VIpqg', title: '432 Hz - Deep Healing Frequency', channel: 'Meditative Mind', duration: '8:00:00', category: 'frequencies', isLive: false, views: '28M' },
        { id: 'freq-2', videoId: 'dCIA6XVe2nc', title: '528 Hz - DNA Repair & Transformation', channel: 'PowerThoughts Meditation Club', duration: '3:00:00', category: 'frequencies', isLive: false, views: '15M' },
        { id: 'freq-3', videoId: 'LXKRsJWqORc', title: '40 Hz Gamma Binaural Beats - Focus & Memory', channel: 'Brainwave Music', duration: '2:00:00', category: 'frequencies', isLive: false, views: '5.2M' },
        { id: 'freq-4', videoId: 'WTr9xnvnLKo', title: 'Alpha Waves 10 Hz - Relaxation & Creativity', channel: 'Greenred Productions', duration: '3:00:00', category: 'frequencies', isLive: false, views: '8M' },
        { id: 'freq-5', videoId: 'SyUXGfS4NyY', title: '963 Hz - Crown Chakra Activation', channel: 'Meditative Mind', duration: '2:00:00', category: 'frequencies', isLive: false, views: '12M' },
        { id: 'freq-6', videoId: 'tJlODWp3Dso', title: 'Theta Waves 6 Hz - Deep Meditation & Sleep', channel: 'Solfeggio Frequencies', duration: '8:00:00', category: 'frequencies', isLive: false, views: '22M' }
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
        queue: [], // Playlist queue
        history: [] // Track history for back-navigation during shuffle
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
                onReady: function(event) {
                    playerState.ytReady = true;
                    event.target.unMute();
                    event.target.setVolume(100);
                },
                onStateChange: function(event) {
                    if (event.data === YT.PlayerState.PLAYING) {
                        playerState.loadingTrack = false;
                        clearTimeout(playerState.loadingTimeout);
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

        playerState.isChilloutSource = false;
        playerState.currentIndex = index;
        const track = playlist[index];

        // Auto-populate queue with full playlist (Spotify-like behavior)
        playerState.queue = playlist.slice();

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
        clearTimeout(playerState.loadingTimeout);
        playerState.loadingTimeout = setTimeout(function() { playerState.loadingTrack = false; }, 5000);
        playerState.ytPlayer.unMute();
        playerState.ytPlayer.setVolume(100);
        playerState.ytPlayer.loadVideoById(track.videoId);
        playerState.isPlaying = true;
        updatePlayIcon();
        startProgressTimer();
        renderQueue();
    }

    function togglePlay() {
        if (!playerState.ytReady || playerState.currentIndex === -1) return;

        if (playerState.isPlaying) {
            playerState.loadingTrack = false; // Clear loading flag on explicit pause
            playerState.ytPlayer.pauseVideo();
            playerState.isPlaying = false;
            updatePlayIcon();
            stopProgressTimer();
        } else {
            playerState.ytPlayer.playVideo();
            playerState.isPlaying = true;
            updatePlayIcon();
            startProgressTimer();
        }
    }

    // Get the active track list based on current source
    function getActiveSource() {
        if (playerState.isChilloutSource && playerState.queue.length > 0) {
            return playerState.queue;
        }
        return playlist;
    }

    // Play a track from the chillout queue by index
    function playQueueTrack(index) {
        if (index < 0 || index >= playerState.queue.length) return;
        if (!playerState.ytReady) return;

        playerState.isChilloutSource = true;
        playerState.currentIndex = index;
        const track = playerState.queue[index];

        musicTitle.textContent = track.title;
        musicComposer.textContent = track.composer;
        musicThumbImg.src = 'https://img.youtube.com/vi/' + track.videoId + '/mqdefault.jpg';
        musicThumbImg.alt = track.title;
        musicPlayerEl.classList.add('visible');

        playerState.loadingTrack = true;
        clearTimeout(playerState.loadingTimeout);
        playerState.loadingTimeout = setTimeout(function() { playerState.loadingTrack = false; }, 5000);
        playerState.ytPlayer.unMute();
        playerState.ytPlayer.setVolume(100);
        playerState.ytPlayer.loadVideoById(track.videoId);
        playerState.isPlaying = true;
        updatePlayIcon();
        startProgressTimer();
        renderQueue();
    }

    function playNext() {
        var source = getActiveSource();
        if (source.length === 0) return;

        // Repeat one: restart current track
        if (playerState.repeatMode === 'one') {
            if (playerState.ytPlayer && playerState.ytPlayer.seekTo) {
                playerState.ytPlayer.seekTo(0);
                playerState.ytPlayer.playVideo();
            }
            return;
        }

        var nextIndex;
        if (playerState.shuffleEnabled) {
            // Push current to history before moving
            if (playerState.currentIndex >= 0) {
                playerState.history.push(playerState.currentIndex);
            }
            // Pick a random track, avoid current if possible
            if (source.length > 1) {
                do {
                    nextIndex = Math.floor(Math.random() * source.length);
                } while (nextIndex === playerState.currentIndex);
            } else {
                nextIndex = 0;
            }
        } else {
            nextIndex = (playerState.currentIndex + 1) % source.length;
            if (nextIndex === 0 && playerState.repeatMode === 'off') {
                closePlayer();
                return;
            }
        }

        if (playerState.isChilloutSource) {
            playQueueTrack(nextIndex);
        } else {
            playTrack(nextIndex);
        }
    }

    function playPrev() {
        var source = getActiveSource();
        if (source.length === 0) return;

        // If more than 3 seconds in, restart current track
        if (playerState.ytReady && playerState.ytPlayer.getCurrentTime && playerState.ytPlayer.getCurrentTime() > 3) {
            playerState.ytPlayer.seekTo(0);
            return;
        }

        var prevIndex;
        if (playerState.shuffleEnabled && playerState.history.length > 0) {
            // Go back through history
            prevIndex = playerState.history.pop();
        } else {
            prevIndex = (playerState.currentIndex - 1 + source.length) % source.length;
        }

        if (playerState.isChilloutSource) {
            playQueueTrack(prevIndex);
        } else {
            playTrack(prevIndex);
        }
    }

    function closePlayer() {
        if (playerState.ytReady && playerState.ytPlayer.stopVideo) {
            playerState.ytPlayer.stopVideo();
        }
        playerState.isPlaying = false;
        playerState.currentIndex = -1;
        playerState.history = [];
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
        if (playing) {
            iconPlay.style.display = 'none';
            iconPause.style.display = 'block';
        } else {
            iconPlay.style.display = 'block';
            iconPause.style.display = 'none';
        }
        // Update sidebar library button playing indicator
        updateSidebarLibraryIndicator(playing);
    }

    function updateSidebarLibraryIndicator(playing) {
        if (!sidebarLibraryBtn) return;
        var isChillout = playing && playerState.isChilloutSource;
        if (isChillout) {
            sidebarLibraryBtn.classList.add('is-playing');
        } else {
            sidebarLibraryBtn.classList.remove('is-playing');
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

        // Live streams return very large durations (>86400s = 24h)
        var isLiveStream = duration > 86400;

        if (isLiveStream) {
            musicProgressFill.style.width = '100%';
            musicProgressInput.value = 100;
            musicTime.textContent = 'LIVE';
        } else if (duration > 0) {
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
        if (duration > 0 && duration <= 86400) {
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
    // Chill-out Library Modal
    // ============================================
    const libraryPanel = document.getElementById('libraryPanel');
    const libraryBackdrop = document.getElementById('libraryBackdrop');
    const sidebarLibraryBtn = document.getElementById('sidebarLibraryBtn');
    const libraryPanelClose = document.getElementById('libraryPanelClose');
    const libraryGrid = document.getElementById('libraryGrid');
    const libraryToggleBtn = document.getElementById('libraryToggleBtn');
    const librarySearch = document.getElementById('librarySearch');
    const filterTabs = document.querySelectorAll('.filter-tab');
    const chilloutShuffleBtn = document.getElementById('chilloutShuffleBtn');

    let currentFilter = 'all';
    let searchQuery = '';

    function renderCardHTML(track, nowPlayingId) {
        return `
            <div class="library-card chillout-card${track.videoId === nowPlayingId ? ' now-playing' : ''}" data-video-id="${track.videoId}" data-category="${track.category}">
                <div class="library-card-thumb">
                    <img src="https://img.youtube.com/vi/${track.videoId}/mqdefault.jpg" alt="${track.title}" loading="lazy">
                    <div class="library-card-play-overlay">
                        <div class="library-card-play-icon">
                            ${track.videoId === nowPlayingId
                                ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>'
                                : '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>'
                            }
                        </div>
                    </div>
                    ${track.isLive ? '<span class="chillout-live-badge">LIVE</span>' : `<span class="chillout-duration-badge">${track.duration}</span>`}
                </div>
                <div class="library-card-info">
                    <h4 class="library-card-title">${track.title}</h4>
                    <p class="library-card-composer">${track.channel}</p>
                    <div class="library-card-meta">
                        <span class="meta-badge">${chilloutCategories[track.category].label}</span>
                        <span class="meta-badge">${track.views}</span>
                    </div>
                </div>
            </div>`;
    }

    function renderChilloutGrid(tracks) {
        if (tracks.length === 0) {
            libraryGrid.innerHTML = '<div class="chillout-empty">No tracks found</div>';
            return;
        }

        // Determine currently playing video ID for highlighting
        var nowPlayingId = '';
        if (playerState.isChilloutSource && playerState.isPlaying && playerState.queue.length > 0 && playerState.currentIndex >= 0) {
            nowPlayingId = playerState.queue[playerState.currentIndex]?.videoId || '';
        }

        // Group tracks by category
        var grouped = {};
        tracks.forEach(function(track) {
            if (!grouped[track.category]) grouped[track.category] = [];
            grouped[track.category].push(track);
        });

        var html = '';

        // Hero banner — first live track
        var heroTrack = tracks.find(function(t) { return t.isLive; });
        if (heroTrack) {
            html += `
                <div class="chillout-hero" data-video-id="${heroTrack.videoId}">
                    <div class="chillout-hero-bg" style="background-image: url('https://img.youtube.com/vi/${heroTrack.videoId}/maxresdefault.jpg')"></div>
                    <div class="chillout-hero-content">
                        <span class="chillout-hero-badge">LIVE NOW</span>
                        <div class="chillout-hero-title">${heroTrack.title}</div>
                        <div class="chillout-hero-meta">${heroTrack.channel} &middot; ${heroTrack.views}</div>
                    </div>
                    <button class="chillout-hero-play">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        Listen Now
                    </button>
                </div>`;
        }

        // Category sections with horizontal carousels
        var categoryOrder = ['lofi', 'focus', 'relaxing', 'nature', 'classical', 'frequencies'];
        categoryOrder.forEach(function(catKey) {
            var catTracks = grouped[catKey];
            if (!catTracks || catTracks.length === 0) return;
            var cat = chilloutCategories[catKey];

            html += `
                <div class="chillout-category-section" data-cat="${catKey}">
                    <div class="chillout-category-header">
                        <div class="chillout-category-info">
                            <div class="chillout-category-icon">${cat.icon}</div>
                            <div class="chillout-category-text">
                                <h4>${cat.label}</h4>
                                <p>${cat.description}</p>
                            </div>
                        </div>
                        <div class="chillout-category-actions">
                            <button class="chillout-play-all-btn" data-play-cat="${catKey}">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                                Play All
                            </button>
                            <button class="chillout-scroll-btn" data-scroll-dir="left" data-scroll-cat="${catKey}">&lsaquo;</button>
                            <button class="chillout-scroll-btn" data-scroll-dir="right" data-scroll-cat="${catKey}">&rsaquo;</button>
                        </div>
                    </div>
                    <div class="chillout-carousel" data-carousel="${catKey}">
                        ${catTracks.map(function(track) { return renderCardHTML(track, nowPlayingId); }).join('')}
                    </div>
                </div>`;
        });

        libraryGrid.innerHTML = html;

        // Click handlers — cards
        document.querySelectorAll('.chillout-card').forEach(function(card) {
            card.addEventListener('click', function() {
                var videoId = card.dataset.videoId;
                var track = chilloutLibrary.find(function(t) { return t.videoId === videoId; });
                if (track) {
                    playChilloutTrack(track);
                    closeLibraryPanel();
                }
            });
        });

        // Click handler — hero banner
        var hero = document.querySelector('.chillout-hero');
        if (hero) {
            hero.addEventListener('click', function() {
                var videoId = hero.dataset.videoId;
                var track = chilloutLibrary.find(function(t) { return t.videoId === videoId; });
                if (track) {
                    playChilloutTrack(track);
                    closeLibraryPanel();
                }
            });
        }

        // Click handlers — Play All per category
        document.querySelectorAll('.chillout-play-all-btn').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                var catKey = btn.dataset.playCat;
                var catTracks = chilloutLibrary.filter(function(t) { return t.category === catKey; });
                if (catTracks.length > 0) {
                    playChilloutTrack(catTracks[0]);
                    closeLibraryPanel();
                }
            });
        });

        // Click handlers — carousel scroll buttons
        document.querySelectorAll('.chillout-scroll-btn').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                var dir = btn.dataset.scrollDir;
                var catKey = btn.dataset.scrollCat;
                var carousel = document.querySelector('[data-carousel="' + catKey + '"]');
                if (carousel) {
                    var scrollAmount = 240;
                    carousel.scrollBy({ left: dir === 'right' ? scrollAmount : -scrollAmount, behavior: 'smooth' });
                }
            });
        });
    }

    function playChilloutTrack(track) {
        playerState.isChilloutSource = true;
        // Queue all tracks from same category for continuous play
        const categoryTracks = chilloutLibrary
            .filter(t => t.category === track.category)
            .map(t => ({
                videoId: t.videoId,
                title: t.title,
                composer: t.channel,
                era: chilloutCategories[t.category].label,
                duration: t.duration,
                description: '',
                tags: [t.category],
                featured: false
            }));

        const startIndex = categoryTracks.findIndex(t => t.videoId === track.videoId);

        // Replace the queue with category tracks
        playerState.queue = categoryTracks;
        playerState.currentIndex = startIndex >= 0 ? startIndex : 0;

        // Update UI and play
        const current = playerState.queue[playerState.currentIndex];
        musicTitle.textContent = current.title;
        musicComposer.textContent = current.composer;
        musicThumbImg.src = `https://img.youtube.com/vi/${current.videoId}/mqdefault.jpg`;
        musicPlayerEl.classList.add('visible');

        if (playerState.ytReady && playerState.ytPlayer) {
            playerState.ytPlayer.loadVideoById(current.videoId);
            playerState.isPlaying = true;
            iconPlay.style.display = 'none';
            iconPause.style.display = 'inline';
        }

        renderQueue();
    }

    function shuffleChillout() {
        playerState.isChilloutSource = true;
        const allTracks = [...chilloutLibrary].sort(() => Math.random() - 0.5);
        const queueTracks = allTracks.map(t => ({
            videoId: t.videoId,
            title: t.title,
            composer: t.channel,
            era: chilloutCategories[t.category].label,
            duration: t.duration,
            description: '',
            tags: [t.category],
            featured: false
        }));

        playerState.queue = queueTracks;
        playerState.currentIndex = 0;

        const current = queueTracks[0];
        musicTitle.textContent = current.title;
        musicComposer.textContent = current.composer;
        musicThumbImg.src = `https://img.youtube.com/vi/${current.videoId}/mqdefault.jpg`;
        musicPlayerEl.classList.add('visible');

        if (playerState.ytReady && playerState.ytPlayer) {
            playerState.ytPlayer.loadVideoById(current.videoId);
            playerState.isPlaying = true;
            iconPlay.style.display = 'none';
            iconPause.style.display = 'inline';
        }

        renderQueue();
        closeLibraryPanel();
    }

    function filterChilloutLibrary() {
        let filtered = chilloutLibrary;

        // Apply category filter
        if (currentFilter !== 'all') {
            filtered = filtered.filter(t => t.category === currentFilter);
        }

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(t =>
                t.title.toLowerCase().includes(query) ||
                t.channel.toLowerCase().includes(query) ||
                chilloutCategories[t.category].label.toLowerCase().includes(query)
            );
        }

        renderChilloutGrid(filtered);
    }

    function openLibraryPanel() {
        libraryPanel.classList.add('active');
        libraryBackdrop.classList.add('active');
        if (sidebarLibraryBtn) sidebarLibraryBtn.classList.add('active');
        filterChilloutLibrary();
    }

    function closeLibraryPanel() {
        libraryPanel.classList.remove('active');
        libraryBackdrop.classList.remove('active');
        if (sidebarLibraryBtn) sidebarLibraryBtn.classList.remove('active');
    }

    // Event listeners — sidebar button (primary)
    if (sidebarLibraryBtn) {
        sidebarLibraryBtn.addEventListener('click', () => {
            if (libraryPanel.classList.contains('active')) {
                closeLibraryPanel();
            } else {
                openLibraryPanel();
            }
        });
    }

    // Performances section button (secondary)
    if (libraryToggleBtn) {
        libraryToggleBtn.addEventListener('click', openLibraryPanel);
    }

    if (chilloutShuffleBtn) {
        chilloutShuffleBtn.addEventListener('click', shuffleChillout);
    }

    // Close button inside panel
    if (libraryPanelClose) {
        libraryPanelClose.addEventListener('click', closeLibraryPanel);
    }

    // Click backdrop to close
    if (libraryBackdrop) {
        libraryBackdrop.addEventListener('click', closeLibraryPanel);
    }

    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.dataset.filter;
            filterChilloutLibrary();
        });
    });

    if (librarySearch) {
        librarySearch.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            filterChilloutLibrary();
        });
    }

    // Escape key handler for library panel
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && libraryPanel && libraryPanel.classList.contains('active')) {
            closeLibraryPanel();
        }
    });

    // ============================================
    // Queue Management
    // ============================================
    const queuePanel = document.getElementById('queuePanel');
    const queueList = document.getElementById('queueList');
    const queueToggleBtn = document.getElementById('queueToggleBtn');
    const queueClearBtn = document.getElementById('queueClearBtn');
    const queueCloseBtn = document.getElementById('queueCloseBtn');
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

        queueList.innerHTML = playerState.queue.map((item, queuePosition) => {
            // Support both index-based queue (original) and object-based queue (chillout)
            const track = typeof item === 'number' ? playlist[item] : item;
            if (!track) return '';
            const isCurrent = queuePosition === playerState.currentIndex;
            return `
                <div class="queue-item ${isCurrent ? 'current' : ''}" data-position="${queuePosition}" data-track="${typeof item === 'number' ? item : queuePosition}">
                    <span class="queue-item-number">${isCurrent ? '▶' : queuePosition + 1}</span>
                    <img class="queue-item-thumb" src="https://img.youtube.com/vi/${track.videoId}/mqdefault.jpg" alt="">
                    <div class="queue-item-info">
                        <div class="queue-item-title">${track.title}</div>
                        <div class="queue-item-composer">${track.composer}</div>
                    </div>
                    <button class="queue-item-remove" data-remove="${queuePosition}" title="Remove">✕</button>
                </div>
            `;
        }).join('');

        // Click handlers
        document.querySelectorAll('.queue-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.queue-item-remove')) {
                    const position = parseInt(item.dataset.position);
                    const queueItem = playerState.queue[position];
                    if (typeof queueItem === 'number') {
                        playTrack(queueItem);
                    } else if (queueItem) {
                        // Chillout track object — play directly
                        playerState.currentIndex = position;
                        musicTitle.textContent = queueItem.title;
                        musicComposer.textContent = queueItem.composer;
                        musicThumbImg.src = `https://img.youtube.com/vi/${queueItem.videoId}/mqdefault.jpg`;
                        musicPlayerEl.classList.add('visible');
                        if (playerState.ytReady && playerState.ytPlayer) {
                            playerState.ytPlayer.loadVideoById(queueItem.videoId);
                            playerState.isPlaying = true;
                            iconPlay.style.display = 'none';
                            iconPause.style.display = 'inline';
                        }
                        renderQueue();
                    }
                }
            });
        });

        document.querySelectorAll('.queue-item-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                removeFromQueue(parseInt(btn.dataset.remove));
            });
        });

        updateQueueCount();
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

    // Event listeners
    if (queueToggleBtn) {
        queueToggleBtn.addEventListener('click', toggleQueue);
    }

    if (queueClearBtn) {
        queueClearBtn.addEventListener('click', clearQueue);
    }

    if (queueCloseBtn) {
        queueCloseBtn.addEventListener('click', function() {
            if (queuePanel) queuePanel.classList.remove('visible');
        });
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
