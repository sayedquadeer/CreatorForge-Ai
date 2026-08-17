document.addEventListener('DOMContentLoaded', () => {
    // FAQ Accordion Toggle
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        if (question && answer) {
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                // Close all items
                faqItems.forEach(i => {
                    i.classList.remove('active');
                    const a = i.querySelector('.faq-answer');
                    if (a) a.style.maxHeight = null;
                });

                // Open clicked if not active
                if (!isActive) {
                    item.classList.add('active');
                    answer.style.maxHeight = answer.scrollHeight + "px";
                }
            });
        }
    });

    // Template Gallery Tabs Setup
    const tabBtns = document.querySelectorAll('.tab-btn');
    const templateCards = document.querySelectorAll('.template-card');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const category = btn.getAttribute('data-tab');
            templateCards.forEach(card => {
                if (category === 'all' || card.getAttribute('data-category') === category) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
});

