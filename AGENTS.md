# 努力城堡

先讀 README.md。純靜態，GitHub Pages 用 main 根目錄。與勇氣城堡（courage-castle）完全獨立，不讀寫其存檔。

- 存檔 key `effort-castle-v1`；改格式要在 `engine.read()` 兼容舊資料。磚的次序就是 log 次序，每層固定 10 塊（`FLOOR`），不要改，否則舊城堡會變樣。
- 努力項目只可「隱藏」不可刪除，舊磚靠 type id 取顏色。
- 設計：手機直向優先；按鈕不用 emoji，用 `art.js` 的 SVG 圖示；按下要有彈性動感。SVG 內有 transform 屬性的元素不可直接加 CSS transform 動畫（會蓋掉位置），要包多一層 `<g>`。
- 內容須符合使用者的基督教信仰：不用星座、占星或其他宗教用語。文案繁體中文、讚賞過程與努力。
- 測試用端口 4192（4190 會被 WebKit 封鎖）。修改後 `npm test` 並看手機截圖。不要提交 node_modules／test-results。
- 大屏幕模式：`screen.html/js/css` 只讀顯示；手機 `app.js` 的 `save(ev)` 會推送狀態及事件（brick／undo／sync）。中轉 `link-server/server.ts` 由 Zo process 服務 `effort-castle-link`（18796）執行，經 `Migration/shared_entrypoint.py` 的 `/effort-link` 掛載；修改 server.ts 後用 update_user_service 重啟該服務。不要改成長連線（共用入口線程有限）。服務名額已滿（Basic 5 個公開服務），不要另開公開服務。
- 同一頁面同時有兩個城堡 SVG 會撞 `id="sky"` 等漸層，隱藏的那個要清空 innerHTML。
