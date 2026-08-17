/**
 * Original Vector-based Preset Thumbnail Templates
 */
const THUMBNAIL_TEMPLATES = [
    {
        id: 'gaming-epic',
        name: 'Gaming Survival',
        category: 'gaming',
        bg: 'linear-gradient(135deg, #0f172a, #4338ca)',
        objects: [
            { type: 'rect', left: 640, top: 360, width: 1200, height: 640, fill: '#1e1b4b', rx: 16, ry: 16, stroke: '#6366f1', strokeWidth: 4 },
            { type: 'text', text: 'EPIC SURVIVAL', left: 640, top: 280, fontSize: 80, fontFamily: 'Anton', fill: '#f59e0b', stroke: '#000000', strokeWidth: 3 },
            { type: 'text', text: 'EPISODE 01', left: 640, top: 420, fontSize: 55, fontFamily: 'Bebas Neue', fill: '#ffffff' }
        ]
    },
    {
        id: 'tech-review',
        name: 'Tech Review Pro',
        category: 'technology',
        bg: 'linear-gradient(135deg, #0284c7, #0f172a)',
        objects: [
            { type: 'rect', left: 400, top: 360, width: 600, height: 500, fill: 'rgba(15,23,42,0.7)', stroke: '#38bdf8', strokeWidth: 2 },
            { type: 'text', text: 'DON\'T BUY!', left: 400, top: 300, fontSize: 75, fontFamily: 'Montserrat', fontWeight: 'bold', fill: '#ef4444' },
            { type: 'text', text: 'Full Review 2026', left: 400, top: 400, fontSize: 40, fontFamily: 'Inter', fill: '#ffffff' }
        ]
    },
    {
        id: 'business-growth',
        name: 'Business Podcast',
        category: 'business',
        bg: '#1e293b',
        objects: [
            { type: 'circle', left: 950, top: 360, radius: 220, fill: '#6366f1' },
            { type: 'text', text: 'HOW TO SCALE', left: 450, top: 320, fontSize: 70, fontFamily: 'Oswald', fill: '#ffffff' },
            { type: 'text', text: '10X YOUR REVENUE', left: 450, top: 420, fontSize: 50, fontFamily: 'Poppins', fill: '#38bdf8' }
        ]
    },
    {
        id: 'youtube-vlog',
        name: 'Daily Travel Vlog',
        category: 'youtube',
        bg: 'linear-gradient(135deg, #b91c1c, #f59e0b)',
        objects: [
            { type: 'text', text: '24 HOURS IN TOKYO', left: 640, top: 320, fontSize: 75, fontFamily: 'Anton', fill: '#ffffff', stroke: '#000000', strokeWidth: 4 },
            { type: 'rect', left: 640, top: 440, width: 450, height: 70, fill: '#ffffff', rx: 10, ry: 10 },
            { type: 'text', text: 'UNBELIEVABLE!', left: 640, top: 440, fontSize: 40, fontFamily: 'Montserrat', fontWeight: 'bold', fill: '#b91c1c' }
        ]
    },
    {
        id: 'edu-tutorial',
        name: 'Coding Tutorial',
        category: 'education',
        bg: '#090d16',
        objects: [
            { type: 'rect', left: 640, top: 360, width: 1150, height: 600, fill: '#111827', stroke: '#10b981', strokeWidth: 3 },
            { type: 'text', text: 'LEARN JS IN 10 MINS', left: 640, top: 320, fontSize: 65, fontFamily: 'Bebas Neue', fill: '#10b981' },
            { type: 'text', text: 'Zero to Hero Masterclass', left: 640, top: 410, fontSize: 35, fontFamily: 'Inter', fill: '#9ca3af' }
        ]
    },
    {
        id: 'gaming-stream',
        name: 'Live Stream Announcement',
        category: 'gaming',
        bg: 'linear-gradient(135deg, #581c87, #0f172a)',
        objects: [
            { type: 'text', text: 'LIVE NOW', left: 640, top: 280, fontSize: 90, fontFamily: 'Anton', fill: '#ef4444' },
            { type: 'text', text: 'RANKED TO CHAMPION', left: 640, top: 400, fontSize: 45, fontFamily: 'Poppins', fill: '#ffffff' }
        ]
    },
    {
        id: 'finance-crypto',
        name: 'Crypto & Investing',
        category: 'business',
        bg: 'linear-gradient(135deg, #064e3b, #022c22)',
        objects: [
            { type: 'text', text: 'NEXT 100X GEM?', left: 640, top: 300, fontSize: 75, fontFamily: 'Oswald', fill: '#34d399' },
            { type: 'text', text: 'Top Altcoins to Watch', left: 640, top: 400, fontSize: 40, fontFamily: 'Inter', fill: '#ffffff' }
        ]
    },
    {
        id: 'tech-ai',
        name: 'AI Tools Breakthrough',
        category: 'technology',
        bg: '#0f172a',
        objects: [
            { type: 'circle', left: 640, top: 360, radius: 280, fill: 'rgba(99,102,241,0.15)', stroke: '#6366f1', strokeWidth: 2 },
            { type: 'text', text: 'FUTURE OF AI', left: 640, top: 320, fontSize: 80, fontFamily: 'Montserrat', fontWeight: 'bold', fill: '#ffffff' },
            { type: 'text', text: 'Tools You Must Try', left: 640, top: 420, fontSize: 40, fontFamily: 'Poppins', fill: '#818cf8' }
        ]
    }
];

function loadTemplateIntoCanvas(engine, template) {
    engine.canvas.clear();
    
    if (template.bg.startsWith('linear-gradient')) {
        // Fallback smooth background state for CSS linear-gradients
        engine.canvas.setBackgroundColor('#0f172a', engine.canvas.renderAll.bind(engine.canvas));
    } else {
        engine.canvas.setBackgroundColor(template.bg, engine.canvas.renderAll.bind(engine.canvas));
    }

    template.objects.forEach(objData => {
        if (objData.type === 'rect') {
            const r = new fabric.Rect({
                left: objData.left,
                top: objData.top,
                width: objData.width,
                height: objData.height,
                fill: objData.fill,
                rx: objData.rx || 0,
                ry: objData.ry || 0,
                stroke: objData.stroke || '',
                strokeWidth: objData.strokeWidth || 0,
                originX: 'center',
                originY: 'center',
                cornerColor: '#6366f1'
            });
            engine.canvas.add(r);
        } else if (objData.type === 'circle') {
            const c = new fabric.Circle({
                left: objData.left,
                top: objData.top,
                radius: objData.radius,
                fill: objData.fill,
                stroke: objData.stroke || '',
                strokeWidth: objData.strokeWidth || 0,
                originX: 'center',
                originY: 'center',
                cornerColor: '#6366f1'
            });
            engine.canvas.add(c);
        } else if (objData.type === 'text') {
            const t = new fabric.IText(objData.text, {
                left: objData.left,
                top: objData.top,
                fontSize: objData.fontSize,
                fontFamily: objData.fontFamily,
                fontWeight: objData.fontWeight || 'normal',
                fill: objData.fill,
                stroke: objData.stroke || '',
                strokeWidth: objData.strokeWidth || 0,
                originX: 'center',
                originY: 'center',
                cornerColor: '#6366f1'
            });
            engine.canvas.add(t);
        }
    });

    engine.canvas.renderAll();
              }
