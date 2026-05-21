(function () {
    const startDate = new Date("2026-04-13T12:00:00");
    function updateRuntime() {
        const now = new Date();
        let years = 0;
        let current = new Date(startDate);
        while (true) {
            const nextYear = new Date(
                current.getFullYear() + 1,
                current.getMonth(),
                current.getDate(),
                current.getHours(),
                current.getMinutes(),
                current.getSeconds()
            );
            if (nextYear <= now) {
                current = nextYear;
                years++;
            } else {
                break;
            }
        }
        let diffMs = now - current;
        if (diffMs < 0) diffMs = 0;
        const totalSeconds = Math.floor(diffMs / 1000);
        const days = Math.floor(totalSeconds / 86400);   // 整天数
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        document.getElementById('site-runtime').textContent =
        `本站已运行 ${years} 年 ${days} 天 ${hours} 时 ${minutes} 分 ${seconds} 秒`;
    }
    updateRuntime();
    setInterval(updateRuntime, 1000);
})();
