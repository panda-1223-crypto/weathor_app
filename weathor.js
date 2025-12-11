const apikey = "b0bc5bf04675e1ee9e00cd393fb7d2f6";
const historyList = document.getElementById("history-list");

// API連携
async function getWeather(city){
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apikey}&units=metric&lang=ja`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
}

// 通常データ　ローカルストレージセット
function updateHistory(city){
    
    let history = getHistory();
    history = history.filter(item => item !== city);
    history.push(city);

    if(history.length > 10){
        history.shift();
    }

    const favoriteHistory = getFavoriteHistory();
    if(favoriteHistory.includes(city)){
        return undefined;
    }
    
    localStorage.setItem("history", JSON.stringify(history));
    return history;
}

// お気に入りリスト＆通常履歴　1項目削除(number == 1:通常履歴、number == 2:お気に入りリスト)
function deleteHistoryItem(historyItem, number){
    if (number == 1) {
        let history = getHistory();
        history = history.filter(item => item !== historyItem);
        localStorage.setItem("history", JSON.stringify(history));
        return history;

    } else if (number == 2) {
        let favoriteHistory = getFavoriteHistory();
        favoriteHistory = favoriteHistory.filter(item => item !== historyItem);
        localStorage.setItem("favorite", JSON.stringify(favoriteHistory));
        return favoriteHistory;
    }
}

// お気に入りリスト　ローカルストレージセット
function updateFavoriteHistory(city){
    let favoriteHistory = getFavoriteHistory();
    if(favoriteHistory.includes(city)){
        alert("同じ都市が登録されているため、お気に入り登録ができません。")
        return undefined;
    }

    if(favoriteHistory.length > 5){
        alert("5件までしか登録できません。");
        return undefined;
    }

    favoriteHistory = favoriteHistory.filter(item => item !== city);
    favoriteHistory.push(city);
    localStorage.setItem("favorite", JSON.stringify(favoriteHistory));
    deleteHistoryItem(city, 1);

    return favoriteHistory;
}

// UI表示（検索履歴）
function updateHistoryOfDisp(history, favoriteHistory){
    historyList.innerHTML = "";
    let margeList = [];
    for(let item of favoriteHistory){
        margeList.push(item);
    }

    for(let item of history){
        margeList.push(item);
    }

    for(let item of margeList){
        const li = document.createElement("li");
        li.textContent = item;

        // 削除ボタン押下処理
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "✖";
        deleteBtn.classList.add("rireki-btn");
        deleteBtn.addEventListener("click", function(e){
            e.stopPropagation();

            const favoriteHistory = getFavoriteHistory();
            let newHistory = [];
            let newFavoriteHistory = [];

            if(favoriteHistory.includes(item)){
                newHistory = getHistory();
                newFavoriteHistory = deleteHistoryItem(item, 2);
            }else{
                newHistory = deleteHistoryItem(item, 1);
                newFavoriteHistory = favoriteHistory;
            }
            updateHistoryOfDisp(newHistory, newFavoriteHistory);
        })

        const favoriteBtn = document.createElement("button");
        if(favoriteHistory.includes(item)){
            favoriteBtn.textContent = "☆"
        }else{
            favoriteBtn.textContent = "★";
        }
        favoriteBtn.classList.add("rireki-btn");
        
        // お気に入りボタン押下処理
        favoriteBtn.addEventListener("click", (e) => {
            e.stopPropagation();

            const favoriteHistory = updateFavoriteHistory(item);
            if (favoriteHistory == undefined) {
                return;
            }
            const history = getHistory();
            updateHistoryOfDisp(history, favoriteHistory);
        })

        li.appendChild(deleteBtn);
        li.appendChild(favoriteBtn);

        //項目押下処理
        li.addEventListener("click", async() =>{
            const data = await getWeather(item);
            setTextContent(data);
        })

        historyList.appendChild(li);
    }
}

// 最新の履歴取得
function getHistory(){
    const history = JSON.parse(localStorage.getItem("history")) || [];
    return history;
}

// 最新のお気に入りリスト取得
function getFavoriteHistory(){
    const favoriteHistory = JSON.parse(localStorage.getItem("favorite")) || [];
    return favoriteHistory;
}

// テキストセット
function setTextContent(data) {
    document.getElementById("city-name").textContent = `都市名: ${data.name}`;
    document.getElementById("weather-desc").textContent = `天気: ${data.weather[0].description}`;
    document.getElementById("temp").textContent = `気温: ${data.main.temp} ℃`;
    document.getElementById("humidity").textContent = `湿度: ${data.main.humidity} %`;
    document.getElementById("umi").textContent = `海水レベル: ${data.main.sea_level}`;

    const iconCode = data.weather[0].icon;
    document.getElementById("weather-icon").src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    document.getElementById("weather-icon").alt = data.weather[0].description;
}

document.getElementById("search_btn").addEventListener("click", async () => {
    try {
        const city = document.getElementById("city_input").value;

        if (!city) {
            alert("都市名を入力してください");
            return;
        }

        const data = await getWeather(city);
        if(data.cod == "404"){
            alert("都市が見つかりません。再度入力をお願いします。");
            return;
        }

        setTextContent(data);
        document.getElementById("city_input").value = "";

        const history = updateHistory(city);
        if(history == undefined){
            return;
        }
        const favoriteHistory = getFavoriteHistory();
        updateHistoryOfDisp(history, favoriteHistory);

    } catch (err){
        alert("エラーが出ました。担当者にご連絡をお願いいたします。");
    }
});

document.getElementById("delete-history").addEventListener("click", function (){
    localStorage.removeItem("history");
    localStorage.removeItem("favorite");
    historyList.innerHTML = "";
});

window.addEventListener("load", () =>{
    const history = getHistory();
    const favoriteHistory = getFavoriteHistory();
    updateHistoryOfDisp(history, favoriteHistory);
});