document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const uploadArea = document.getElementById('upload-area');
    const scriptInput = document.getElementById('script-input');
    const processBtn = document.getElementById('process-btn');
    const loadingIndicator = document.getElementById('loading-indicator');
    const notesContent = document.getElementById('notes-content');
    const gestureDisplay = document.getElementById('gesture-display');

    let selectedFile = null;

    // --- Event Listeners ---

    // 1. Trigger file input when the upload area is clicked
    uploadArea.addEventListener('click', () => {
        scriptInput.click();
    });

    // 2. Handle file selection
    scriptInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'text/plain') {
            selectedFile = file;
            uploadArea.querySelector('span').textContent = `已選取: ${file.name}`;
            processBtn.disabled = false;
        } else {
            selectedFile = null;
            uploadArea.querySelector('span').textContent = '📂 點擊此處上傳講稿 (.txt)';
            processBtn.disabled = true;
            alert('請選取一個 .txt 檔案。');
        }
    });

    // 3. Process button click to send file to backend
    processBtn.addEventListener('click', async () => {
        if (!selectedFile) {
            alert('請先選取一個檔案。');
            return;
        }

        loadingIndicator.style.display = 'block';
        processBtn.disabled = true;

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch('/scripts/auto-tag', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || '伺服器發生錯誤');
            }

            const result = await response.json();
            renderTaggedScript(result.tagged_script);

        } catch (error) {
            notesContent.innerHTML = `<p style="color: red;">處理失敗：${error.message}</p>`;
        } finally {
            loadingIndicator.style.display = 'none';
        }
    });

    // 4. Handle clicks on gesture tags
    notesContent.addEventListener('click', (event) => {
        const target = event.target;
        if (target.classList.contains('gesture-tag')) {
            gestureDisplay.textContent = target.textContent;
            gestureDisplay.classList.remove('placeholder');
        }
    });

    // --- Helper Functions ---

    function renderTaggedScript(script) {
        notesContent.innerHTML = ''; // Clear previous content
        if (!script || script.length === 0) {
            notesContent.innerHTML = '<p>處理完成，但沒有任何內容。</p>';
            return;
        }

        script.forEach(paragraph => {
            const p = document.createElement('p');
            p.innerHTML = parseAndStyleTags(paragraph.text);
            notesContent.appendChild(p);
        });
    }

    function parseAndStyleTags(text) {
        const tagRegex = /\\\\\[(E|G):(.+?)\\\\]/g;
        return text.replace(tagRegex, (match, type, value) => {
            const tagClass = type === 'E' ? 'emotion-tag' : 'gesture-tag';
            return `<span class="tag ${tagClass}" data-type="${type}">${value}</span>`;
        });
    }
});
