# 努力城堡

先讀 README.md。純靜態，GitHub Pages 用 main 根目錄。與勇氣城堡（courage-castle）完全獨立，不讀寫其存檔。

- 存檔 key `effort-castle-v1`；改格式要在 `engine.read()` 兼容舊資料。磚的次序就是 log 次序，每層固定 10 塊（`FLOOR`），不要改，否則舊城堡會變樣。
- 努力項目只可「隱藏」不可刪除，舊磚靠 type id 取顏色。
- 設計：手機直向優先；按鈕不用 emoji，用 `art.js` 的 SVG 圖示；按下要有彈性動感。SVG 內有 transform 屬性的元素不可直接加 CSS transform 動畫（會蓋掉位置），要包多一層 `<g>`。
- 內容須符合使用者的基督教信仰：不用星座、占星或其他宗教用語。文案繁體中文、讚賞過程與努力。
- 測試用端口 4192（4190 會被 WebKit 封鎖）。修改後 `npm test` 並看手機截圖。不要提交 node_modules／test-results。
