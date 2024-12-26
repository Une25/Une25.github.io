
var y;
var m;

document.addEventListener('DOMContentLoaded', function () {
    const calendar = document.getElementById('calendar');
    let now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth();
    y = year;
    m = month;
    let selectedDate = null;
    const today = `${year}-${pad(month + 1)}-${pad(now.getDate())}`;

    // 年ごとの祝日の設定
    const holidays = {
        "01-01": "元日",
        "01-08": "成人の日",
        "02-11": "建国記念の日",
        "02-23": "天皇誕生日",
        "03-20": "春分の日",
        "04-29": "昭和の日",
        "05-03": "憲法記念日",
        "05-04": "みどりの日",
        "05-05": "こどもの日",
        "07-15": "海の日",
        "08-11": "山の日",
        "09-16": "敬老の日",
        "09-23": "秋分の日",
        "10-14": "体育の日",
        "11-03": "文化の日",
        "11-23": "勤労感謝の日",
        "12-23": "天皇誕生日"
    };

    function loadSavedTimes() {
        return JSON.parse(localStorage.getItem('calendarTimes')) || {};
    }

    function saveTime(date, startTime, endTime) {
        const savedTimes = loadSavedTimes();
        savedTimes[date] = { startTime, endTime };
        localStorage.setItem('calendarTimes', JSON.stringify(savedTimes));
    }

    function deleteTime(date) {
        const savedTimes = loadSavedTimes();
        delete savedTimes[date];
        localStorage.setItem('calendarTimes', JSON.stringify(savedTimes));
    }

    function pad(number) {  //日付の統一(一桁だった場合0をつける)
        return number < 10 ? '0' + number : number;
    }

    function isHoliday(date) {
        const holidayKey = `${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
        return holidays[holidayKey] || "";
    }

    function calculateWorkTime(startTime, endTime) {
        const start = new Date(`1970-01-01T${startTime}:00`);
        const end = new Date(`1970-01-01T${endTime}:00`);
        const diff = (end - start) / (1000 * 60 * 60); // 時間の差の計算
        return diff;
    }


    function generateCalendar(year, month) {
        const monthNames = ["1月", "2月", "3月", "4月", "5月", "6月",
            "7月", "8月", "9月", "10月", "11月", "12月"];
        const daysOfWeek = ["日", "月", "火", "水", "木", "金", "土"];
        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();
        const savedTimes = loadSavedTimes();
        let calendarHtml = `<div class="calendar-header"><button id="prevMonth" class="btn btn-outline-primary prev-month">&lt;</button><h2>${year}年${monthNames[month]}</h2><button id="nextMonth" class="btn btn-outline-primary next-month">&gt;</button></div>`;
        calendarHtml += '<table class="table table-bordered">';
        calendarHtml += '<thead><tr>';


        // 曜日ヘッダー
        for (let dayIndex in daysOfWeek) {
            let dayClass = "";
            if (dayIndex == 0) dayClass = "sunday";
            else if (dayIndex == 6) dayClass = "saturday";
            calendarHtml += `<th class="${dayClass}">${daysOfWeek[dayIndex]}</th>`;
        }

        calendarHtml += '</tr></thead><tbody><tr>';   //カレンダー実行

        for (let i = 0; i < firstDay; i++) {
            calendarHtml += '<td></td>';
        }

        for (let date = 1; date <= lastDate; date++) {
            const fullDate = `${year}-${pad(month + 1)}-${pad(date)}`;
            const hasTime = savedTimes[fullDate] ? 'has-time' : '';
            const workTime = savedTimes[fullDate] ? calculateWorkTime(savedTimes[fullDate].startTime, savedTimes[fullDate].endTime) : '';
            const day = new Date(year, month, date).getDay();
            const holidayName = isHoliday(new Date(year, month, date));
            let dayClass = "";
            if (day == 0 || holidayName) dayClass = "sunday holiday";
            else if (day == 6) dayClass = "saturday";
            if (fullDate === today)
                dayClass += "today";
            if ((firstDay + date - 1) % 7 === 0 && date !== 1) {
                calendarHtml += '</tr><tr>';
            }
            calendarHtml += `<td class="${hasTime} ${dayClass}" data-date="${fullDate}"><div class="date-number">${date}</div>${workTime ? `<div class="work-time">${workTime.toFixed(2)}時間</div>` : ''}</td>`;

        }

        calendarHtml += '</tr></tbody></table>';
        calendar.innerHTML = calendarHtml;

        // 日付セルのクリックした時
        document.querySelectorAll('#calendar td[data-date]').forEach(cell => {
            cell.addEventListener('click', function () {
                selectedDate = this.getAttribute('data-date');
                const savedTimes = loadSavedTimes();
                document.getElementById('startTimeInput').value = savedTimes[selectedDate] ? savedTimes[selectedDate].startTime : '';
                document.getElementById('endTimeInput').value = savedTimes[selectedDate] ? savedTimes[selectedDate].endTime : '';
                $('#timeModal').modal('show');
            });
        });

        //前の月、次の月を選択した時の挙動
        document.getElementById('prevMonth').addEventListener('click', function () {
            if (month === 0) {
                month = 11;
                year--;
            } else {
                month--;
            }

            m = month;
            y = year;
            generateCalendar(year, month);
            //calculateSalary();

        });

        document.getElementById('nextMonth').addEventListener('click', function () {
            if (month === 11) {
                month = 0;
                year++;
            } else {
                month++;
            }
            m = month;
            y = year;
            generateCalendar(year, month);
            //calculateSalary();

        });
        // 月ごとの合計給料を計算
        calculateMonthlySalary(year, month);
    }


    // 月ごとの合計給料計算
    function calculateMonthlySalary(year, month) {
        const baseWage = parseFloat(document.getElementById('baseWage').value) || 0;
        const overtimeWage = parseFloat(document.getElementById('overtimeWage').value) || 0;
        const holidayWage = parseFloat(document.getElementById('holidayWage').value) || 0;
        const holidayOvertimeWage = parseFloat(document.getElementById('holidayOvertimeWage').value) || 0;
        const overtimeStart = document.getElementById('overtimeStart').value;
        const overtimeEnd = document.getElementById('overtimeEnd').value;

        const savedTimes = loadSavedTimes();
        let monthlySalary = 0;

        for (const date in savedTimes) {
            const dateObj = new Date(date);

            // 指定された月のデータのみ計算
            if (dateObj.getFullYear() === year && dateObj.getMonth() === month) {
                const { startTime, endTime } = savedTimes[date];
                const workTime = calculateWorkTime(startTime, endTime);
                const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
                const holidayName = isHoliday(dateObj);

                let dailySalary = 0;

                if (holidayName || isWeekend) {
                    if (overtimeStart && overtimeEnd) {
                        const overtimeHours = calculateOvertimeHours(startTime, endTime, overtimeStart, overtimeEnd);
                        dailySalary += overtimeHours * holidayOvertimeWage;
                        dailySalary += (workTime - overtimeHours) * holidayWage;
                    } else {
                        dailySalary += workTime * holidayWage;
                    }
                } else {
                    if (overtimeStart && overtimeEnd) {
                        const overtimeHours = calculateOvertimeHours(startTime, endTime, overtimeStart, overtimeEnd);
                        dailySalary += overtimeHours * overtimeWage;
                        dailySalary += (workTime - overtimeHours) * baseWage;
                    } else {
                        dailySalary += workTime * baseWage;
                    }
                }

                monthlySalary += dailySalary;
            }
        }

        // 月ごとの合計給料を表示
        document.getElementById('monthlySalaryDisplay').textContent = `¥${monthlySalary.toLocaleString()}`;
    }


    // 割増時間計算
    function calculateOvertimeHours(startTime, endTime, overtimeStart, overtimeEnd) {
        const start = new Date(`1970-01-01T${startTime}:00`);
        const end = new Date(`1970-01-01T${endTime}:00`);
        const overtimeStartTime = new Date(`1970-01-01T${overtimeStart}:00`);
        const overtimeEndTime = new Date(`1970-01-01T${overtimeEnd}:00`);

        let overtimeHours = 0;

        if (start < overtimeEndTime && end > overtimeStartTime) {
            const overtimeStartEffective = start > overtimeStartTime ? start : overtimeStartTime;
            const overtimeEndEffective = end < overtimeEndTime ? end : overtimeEndTime;
            overtimeHours = (overtimeEndEffective - overtimeStartEffective) / (1000 * 60 * 60);
        }

        return overtimeHours;
    }

    // 時給設定保存処理
    function loadWageSettings() {
        const settings = JSON.parse(localStorage.getItem('wageSettings')) || {
            baseWage: 0,
            overtimeWage: 0,
            holidayWage: 0,
            holidayOvertimeWage: 0,
            overtimeStart: '',
            overtimeEnd: '',
        };
        document.getElementById('baseWage').value = settings.baseWage;
        document.getElementById('overtimeWage').value = settings.overtimeWage;
        document.getElementById('holidayWage').value = settings.holidayWage;
        document.getElementById('holidayOvertimeWage').value = settings.holidayOvertimeWage;
        document.getElementById('overtimeStart').value = settings.overtimeStart;
        document.getElementById('overtimeEnd').value = settings.overtimeEnd;
    }

    // 時給設定を保存
    function saveWageSettings() {
        const settings = {
            baseWage: parseFloat(document.getElementById('baseWage').value) || 0,
            overtimeWage: parseFloat(document.getElementById('overtimeWage').value) || 0,
            holidayWage: parseFloat(document.getElementById('holidayWage').value) || 0,
            holidayOvertimeWage: parseFloat(document.getElementById('holidayOvertimeWage').value) || 0,
            overtimeStart: document.getElementById('overtimeStart').value,
            overtimeEnd: document.getElementById('overtimeEnd').value,
        };
        localStorage.setItem('wageSettings', JSON.stringify(settings));
    }

    // 時給設定保存ボタンのイベント
    document.getElementById('saveSettingsButton').addEventListener('click', function () {
        saveWageSettings();
        calculateMonthlySalary(year, month);

        alert('時給設定が保存されました！');
    });

    // カレンダーの日付せるをクリックした時の
    document.querySelectorAll('#calendar td[data-date]').forEach(cell => {
        cell.addEventListener('click', function () {
            selectedDate = this.getAttribute('data-date');
            const savedTimes = loadSavedTimes();
            document.getElementById('startTimeInput').value = savedTimes[selectedDate] ? savedTimes[selectedDate].startTime : '';
            document.getElementById('endTimeInput').value = savedTimes[selectedDate] ? savedTimes[selectedDate].endTime : '';
            $('#timeModal').modal('show');
        });
    });


    // ポップアップ　データ送信　イベント 保存
    document.getElementById('timeForm').addEventListener('submit', function (event) {
        event.preventDefault();
        const startTime = document.getElementById('startTimeInput').value;
        const endTime = document.getElementById('endTimeInput').value;
        saveTime(selectedDate, startTime, endTime);
        generateCalendar(y, m);
        $('#timeModal').modal('hide');


    });

    // 削除ボタン　イベント
    document.getElementById('deleteButton').addEventListener('click', function () {
        deleteTime(selectedDate);
        generateCalendar(y, m);
        $('#timeModal').modal('hide');
    });


    // ページロード時に時給設定を復元
    loadWageSettings();

    // 最初のカレンダーを表示
    generateCalendar(year, month);


    document.getElementById('clearMonthlyData').addEventListener('click', function () {
        // 月ごとにローカルストレージのデータを削除
        const savedTimes = loadSavedTimes();
        const monthStart = new Date(y, m, 1); // 月の初日
        const monthEnd = new Date(y, m + 1, 0); // 月の最終日
    
        // 月ごとのデータを削除
        for (const date in savedTimes) {
            const dateObj = new Date(date);
            if (dateObj.getFullYear() === y && dateObj.getMonth() === m) {
                delete savedTimes[date]; // この月のデータを削除
            }
        }
    
        // 更新されたデータを保存
        localStorage.setItem('calendarTimes', JSON.stringify(savedTimes));
    
        // カレンダーを再生成して表示を更新
        generateCalendar(y, m);
    
        alert('この月のデータが削除されました！');
    });

    
});
