// ページが完全に読み込まれた後に関数を実行
document.addEventListener('DOMContentLoaded', function() {
  // ボタンがクリックされたときにgenerateRoleInputs関数を呼び出す
  document.getElementById("roleButton").addEventListener("click", generateRoleInputs);
});

// 役職の種類と数を設定できるフォームを生成
function generateRoleInputs() {
  const roleInputsDiv = document.getElementById("roleInputs");
  roleInputsDiv.innerHTML = ""; // フィールドをリセット

  const roleContainer = document.createElement("div");
  roleContainer.classList.add("add-role");

  // 役職の追加フォーム
  roleContainer.innerHTML = `
    <label for="newRole">新しい役職名:</label>
    <input type="text" id="newRole" placeholder="役職名を入力" required>
    <label for="roleCount">人数:</label>
    <input type="number" id="roleCount" value="0" min="1" required>
    <button onclick="addRole()">役職を追加</button>
  `;
  roleInputsDiv.appendChild(roleContainer);
}

// 新しい役職を追加
function addRole() {
  const roleName = document.getElementById("newRole").value.trim();
  const roleCount = parseInt(document.getElementById("roleCount").value);
  const playerCount = parseInt(document.getElementById("playerCount").value);

  if (!roleName || roleCount <= 0) {
    alert("役職名と人数を正しく入力してください。");
    return;
  }

  // 現在の役職の人数合計
  let totalRoleCount = 0;
  if (window.roles) {
    totalRoleCount = window.roles.reduce((sum, roleData) => sum + roleData.count, 0);
  }

  // 残り人数を計算
  const remainingPlayers = playerCount - totalRoleCount;

  if (roleCount > remainingPlayers) {
    alert(`残り人数は${remainingPlayers}人です。`);
    return;
  }

  const roleData = { name: roleName, count: roleCount };
  if (!window.roles) {
    window.roles = [];
  }
  window.roles.push(roleData);

  // 役職のリストを表示
  displayAddedRoles();

  // フォームのリセット
  document.getElementById("newRole").value = '';
  document.getElementById("roleCount").value = 1;
}

// 追加された役職のリストを表示
function displayAddedRoles() {
  const addedRolesList = document.getElementById("addedRolesList");
  addedRolesList.innerHTML = ""; // リストをリセット

  if (window.roles) {
    window.roles.forEach((role, index) => {
      const li = document.createElement("li");
      li.textContent = `${role.name} - ${role.count}人`;

      // 削除ボタンを追加
      const removeButton = document.createElement("button");
      removeButton.textContent = "削除";
      removeButton.classList.add("remove-role");
      removeButton.addEventListener("click", function() {
        removeRole(index);
      });

      li.appendChild(removeButton);
      addedRolesList.appendChild(li);
    });
  }
}

// 役職を削除
function removeRole(index) {
  if (window.roles) {
    // 役職を削除
    window.roles.splice(index, 1);
    // 役職リストを再表示
    displayAddedRoles();
  }
}

// プレイヤー数に応じた名前入力フィールドを生成
function generateNameInputs() {
  const playerCount = document.getElementById("playerCount").value;
  const nameInputsDiv = document.getElementById("nameInputs");
  nameInputsDiv.innerHTML = ""; // フィールドをリセット

  if (playerCount < 4 || playerCount > 20) {
    alert("プレイヤー数は4から20人の間で入力してください。");
    return;
  }

  for (let i = 0; i < playerCount; i++) {
    const inputField = document.createElement("div");
    inputField.classList.add("player-name");
    inputField.innerHTML = `<label for="name${i}">プレイヤー${i + 1}の名前:</label>
                           <input type="text" id="name${i}" placeholder="名前を入力" required>`;
    nameInputsDiv.appendChild(inputField);
  }
}

// 役職をランダムに配布
function distributeRoles() {
  const playerCount = parseInt(document.getElementById("playerCount").value);
  const roles = [];
  const playerNames = [];

  // プレイヤー名の取得
  for (let i = 0; i < playerCount; i++) {
    const playerName = document.getElementById(`name${i}`).value.trim();
    if (playerName) {
      playerNames.push(playerName);
    } else {
      alert(`プレイヤー${i + 1}の名前を入力してください。`);
      return;
    }
  }

  // 役職の追加
  window.roles.forEach(roleData => {
    for (let i = 0; i < roleData.count; i++) {
      roles.push(roleData.name);
    }
  });

  // 役職をランダムにシャッフル
  const shuffledRoles = randomizeRoles(roles);

  // 結果の表示
  displayResults(playerNames, shuffledRoles);
}

// ランダムに役職をシャッフル
function randomizeRoles(roles) {
  const shuffledRoles = roles.slice();
  for (let i = shuffledRoles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledRoles[i], shuffledRoles[j]] = [shuffledRoles[j], shuffledRoles[i]];
  }
  return shuffledRoles;
}

// 結果を表示
function displayResults(playerNames, roleDistribution) {
  const resultList = document.getElementById("resultList");
  resultList.innerHTML = ""; // 結果リストをクリア

  playerNames.forEach((playerName, index) => {
    const li = document.createElement("li");
    const deathCheckbox = document.createElement("input");
    deathCheckbox.type = "checkbox";
    deathCheckbox.classList.add("death-checkbox");
    deathCheckbox.addEventListener("change", function() {
      handleDeathCheckboxChange(deathCheckbox, li, playerName);
    });

    const label = document.createElement("label");
    label.innerHTML = `${playerName}: <strong>${roleDistribution[index]}</strong>`;

    // 投票カウント
    const voteCount = document.createElement("span");
    voteCount.classList.add("vote-count");
    voteCount.textContent = "投票数: 0";

    // 投票数増減ボタンとリセットボタン
    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("button-container");

    const increaseVoteButton = document.createElement("button");
    increaseVoteButton.textContent = "+";
    increaseVoteButton.classList.add("vote-button");
    increaseVoteButton.addEventListener("click", function() {
      changeVoteCount(voteCount, 1);
    });

    const decreaseVoteButton = document.createElement("button");
    decreaseVoteButton.textContent = "-";
    decreaseVoteButton.classList.add("vote-button", "decrease");
    decreaseVoteButton.addEventListener("click", function() {
      changeVoteCount(voteCount, -1);
    });

    const resetVoteButton = document.createElement("button");
    resetVoteButton.textContent = "リセット";
    resetVoteButton.classList.add("reset-vote-button");
    resetVoteButton.addEventListener("click", function() {
      resetVoteCount(voteCount);
    });

    buttonContainer.appendChild(increaseVoteButton);
    buttonContainer.appendChild(decreaseVoteButton);
    buttonContainer.appendChild(resetVoteButton);

    li.appendChild(label);
    li.appendChild(deathCheckbox);
    li.appendChild(voteCount);
    li.appendChild(buttonContainer);

    resultList.appendChild(li);
  });
}

// 投票数を増減
function changeVoteCount(voteCount, delta) {
  let currentVote = parseInt(voteCount.textContent.replace("投票数: ", ""));
  currentVote += delta;
  if (currentVote < 0) currentVote = 0;
  voteCount.textContent = `投票数: ${currentVote}`;
}

// 投票カウントをリセット
function resetVoteCount(voteCount) {
  voteCount.textContent = "投票数: 0";
}

// 死亡チェックボックスが変更されたときの処理
function handleDeathCheckboxChange(checkbox, li, playerName) {
  const label = li.querySelector("label");
  if (checkbox.checked) {
    label.classList.add("dead"); // 名前に棒線を引く
    const deathText = document.createElement("span");
    deathText.classList.add("death-text");
    deathText.textContent = "死亡";
    li.appendChild(deathText);
  } else {
    label.classList.remove("dead"); // 棒線を消す
    const deathText = li.querySelector(".death-text");
    if (deathText) {
      deathText.remove(); // 死亡文字を削除
    }
  }
}
