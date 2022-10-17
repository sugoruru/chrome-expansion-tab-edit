//データベースの名前
const dbName = "sites";
//データベースと接続
const openReq = indexedDB.open(dbName, 1);
//もしデータベースが存在しないなら作成
openReq.onupgradeneeded = () => {};

let clickSite = "";
let sites = [];

window.addEventListener(
  "error",
  (e) => {
    e.composedPath()[0].src =
      "https://logo.clearbit.com/logo.clearbit.com?size=320";
  },
  true
);

window.addEventListener("contextmenu", (e) => {
  if (
    e
      .composedPath()
      .map((e) => e.className)
      .filter((v) => v !== "")
      .filter((v) => v !== undefined)[0] === "site"
  ) {
    clickSite = e.composedPath()[2].id;
    document.getElementById("siteContextMenu").style.display = "block";
    document.getElementById("siteContextMenu").style.left = e.pageX + "px";
    document.getElementById("siteContextMenu").style.top = e.pageY + "px";
  }
});
setInterval(() => {
  document.getElementById("fade").style.width =
    document.body.scrollWidth + "px";
  document.getElementById("fade").style.height =
    document.body.scrollHeight + "px";
}, 20);
window.addEventListener("click", () => {
  document.getElementById("siteContextMenu").style.display = "none";
});

document.oncontextmenu = function () {
  return false;
};

document.getElementById("urlInput").addEventListener("focusout", () => {
  if (
    !(
      document.getElementById("urlInput").value.slice(0, 8) === "https://" ||
      document.getElementById("urlInput").value.slice(0, 7) === "http://"
    )
  ) {
    document.getElementById("urlInput").value =
      "https://" + document.getElementById("urlInput").value;
  }
});

document.getElementById("deleteSite").addEventListener("click", () => {
  const openReq = indexedDB.open(dbName, 1);
  openReq.onsuccess = (event) => {
    const db = event.target.result;
    const tr = db.transaction("sites", "readwrite");
    const store = tr.objectStore("sites");
    const request = store.delete(clickSite);
    request.onsuccess = () => {};
    request.onerror = () => {};
  };
  setTimeout(() => {
    location.reload();
  }, 20);
});

const getRandomString = (N) => {
  const S = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from(Array(N))
    .map(() => S[Math.floor(Math.random() * S.length)])
    .join("");
};

document.getElementById("editMenuOpen").addEventListener("click", () => {
  document.getElementById("fade").style.display = "block";
  document.getElementById("menuTitle").textContent = "ブックマーク編集";
  document.getElementById("createButton").textContent = "変更";
  const thisSite = sites[sites.map((v) => v.id).indexOf(clickSite)];
  document.getElementById("urlInput").value = thisSite.url;
  document.getElementById("nameInput").value = thisSite.name;
  document.getElementById("uploadImage").src = thisSite.icon;
  let i = 0;
  const interval = setInterval(() => {
    i++;
    document.getElementById("fade").style.opacity = i / 20;
    if (i === 10) {
      document.getElementById("siteAddBox").style.display = "block";
      clearInterval(interval);
    }
  }, 20);
});

//データベースと通信
openReq.onsuccess = (event) => {
  const db = event.target.result;
  const URLtrans = db.transaction("sites", "readonly");
  const URLstore = URLtrans.objectStore("sites");
  const getReq = URLstore.getAll();
  getReq.onsuccess = (event) => {
    sites = event.target.result;
    event.target.result.forEach((e) => {
      const div = document.createElement("div");
      div.src = e.icon;
      div.className = "site";
      div.style.textAlign = "center";
      div.id = e.id;
      const a = document.createElement("a");
      a.href = e.url;
      div.prepend(a);
      const name = document.createElement("span");
      name.textContent = e.name;
      name.style.fontSize = "20px";
      a.prepend(name);
      const br = document.createElement("br");
      a.prepend(br);
      const image = document.createElement("img");
      image.src = e.icon;
      image.style = "";
      image.width = "286";
      image.height = "163";
      a.prepend(image);
      document.getElementById("allBookmarks").prepend(div);
    });
  };
  db.close();
};

//テーブルを作成
openReq.onupgradeneeded = (event) => {
  const db = event.target.result;
  db.createObjectStore("sites", { keyPath: "id" });
};

document.getElementById("siteAddButton").addEventListener("click", () => {
  document.getElementById("fade").style.display = "block";
  document.getElementById("menuTitle").innerText = "新規ブックマーク";
  document.getElementById("createButton").textContent = "作成";
  let i = 0;
  const interval = setInterval(() => {
    i++;
    document.getElementById("fade").style.opacity = i / 20;
    if (i === 10) {
      document.getElementById("siteAddBox").style.display = "block";
      clearInterval(interval);
    }
  }, 20);
});

document.getElementById("cancelButton").addEventListener("click", () => {
  document.getElementById("siteAddBox").style.display = "none";
  let i = 10;
  const interval = setInterval(() => {
    i--;
    document.getElementById("fade").style.opacity = i / 20;
    if (i === 0) {
      document.getElementById("fade").style.display = "none";
      clearInterval(interval);
    }
  }, 20);
});

document.getElementById("selectFile").addEventListener("change", (e) => {
  const file = e.target.files;
  const reader = new FileReader();
  reader.readAsDataURL(file[0]);
  reader.onload = () => {
    const url = reader.result;
    document.getElementById("uploadImage").src = url;
  };
});
document.getElementById("createButton").addEventListener("click", () => {
  if (
    document.getElementById("urlInput").value !== "" &&
    document.getElementById("nameInput").value !== ""
  ) {
    const openReq = indexedDB.open(dbName, 1);
    openReq.onsuccess = (event) => {
      const db = event.target.result;
      const trans = db.transaction("sites", "readwrite");
      const store = trans.objectStore("sites");
      const iconURL = new URL(document.getElementById("urlInput").value)
        .hostname;
      const img = document.createElement("img");
      img.src = `https://logo.clearbit.com/${iconURL}?size=320`;
      let putReq;
      if (document.getElementById("createButton").innerHTML === "変更") {
        const request = store.delete(clickSite);
        request.onsuccess = () => {};
        request.onerror = () => {};
        putReq = store.put({
          id: clickSite,
          url: document.getElementById("urlInput").value,
          name: document.getElementById("nameInput").value,
          icon:
            document.getElementById("uploadImage").src !== ""
              ? document.getElementById("uploadImage").src
              : `https://logo.clearbit.com/${iconURL}?size=320`,
        });
      } else {
        putReq = store.put({
          id: getRandomString(64),
          url: document.getElementById("urlInput").value,
          name: document.getElementById("nameInput").value,
          icon:
            document.getElementById("uploadImage").src !== ""
              ? document.getElementById("uploadImage").src
              : `https://logo.clearbit.com/${iconURL}?size=320`,
        });
      }
      putReq.onsuccess = function () {};
      document.getElementById("urlInput").value = "";
      document.getElementById("nameInput").value = "";
      document.getElementById("uploadImage").src = "";
      document.getElementById("siteAddBox").style.display = "none";
      let i = 10;
      const interval = setInterval(() => {
        i--;
        document.getElementById("fade").style.opacity = i / 20;
        if (i === 0) {
          document.getElementById("fade").style.display = "none";
          clearInterval(interval);
        }
      }, 20);
      db.close();
      setTimeout(() => {
        location.reload();
      }, 20);
    };
  }
});
