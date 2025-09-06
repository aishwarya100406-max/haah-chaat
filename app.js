const username = localStorage.getItem('username');
if (!username) window.location.href = 'index.html';

const chatWindow = document.getElementById('chat-window');
const typingIndicator = document.getElementById('typing-indicator');
let typingTimeout;

// Send message (or edit if key provided)
function sendMessage(editKey = null) {
  const msg = document.getElementById('message').value.trim();
  if (!msg) return;
  const msgData = { sender: username, message: msg, timestamp: Date.now() };
  if (editKey) {
    database.ref(`messages/${editKey}`).update(msgData);
    sendMessage.keyToEdit = null;
  } else {
    database.ref('messages').push(msgData);
  }
  document.getElementById('message').value = '';
  updateTyping(false);
  updateLastSeen();
}

// Send emoji
function sendEmoji(emoji) {
  const msgData = { sender: username, message: emoji, timestamp: Date.now() };
  database.ref('messages').push(msgData);
  updateLastSeen();
}

// Toggle emoji picker
function toggleEmojiPicker(show) {
  const picker = document.getElementById('emoji-picker');
  if (show === undefined) picker.style.display = picker.style.display === 'none' ? 'flex' : 'none';
  else picker.style.display = show ? 'flex' : 'none';
}

// Typing indicator
function updateTyping(isTyping = true) {
  database.ref(`typing/${username}`).set(isTyping);
  clearTimeout(typingTimeout);
  if (isTyping) {
    typingTimeout = setTimeout(() => updateTyping(false), 2000);
  }
}

// Last seen
function updateLastSeen() {
  database.ref(`lastSeen/${username}`).set(Date.now());
}

// Edit message
function editMessage(key, oldMessage) {
  document.getElementById('message').value = oldMessage;
  sendMessage.keyToEdit = key;
}

// Delete message
function deleteMessage(key) {
  database.ref(`messages/${key}`).remove();
}

// Listen for messages
database.ref('messages').on('value', snapshot => {
  chatWindow.innerHTML = '';
  const msgs = snapshot.val();
  if (!msgs) return;
  for (let key in msgs) {
    const div = document.createElement('div');
    div.className = msgs[key].sender === username ? 'my-msg' : 'other-msg';
    const time = new Date(msgs[key].timestamp);
    const hours = time.getHours().toString().padStart(2, '0');
    const mins = time.getMinutes().toString().padStart(2, '0');
    div.innerHTML = `<b>${msgs[key].sender}:</b> ${msgs[key].message} <span style="font-size:10px;">(${hours}:${mins})</span>`;
    if (msgs[key].sender === username) {
      div.innerHTML += ` <button onclick="editMessage('${key}','${msgs[key].message}')">✏️</button> <button onclick="deleteMessage('${key}')">🗑️</button>`;
    }
    chatWindow.appendChild(div);
  }
  chatWindow.scrollTop = chatWindow.scrollHeight;
});

// Listen for typing
database.ref('typing').on('value', snapshot => {
  const usersTyping = snapshot.val() || {};
  const others = Object.keys(usersTyping).filter(u => u !== username && usersTyping[u]);
  typingIndicator.innerText = others.length ? `${others.join(', ')} is typing...` : '';
});

// Display last seen for other users
database.ref('lastSeen').on('value', snapshot => {
  const lastSeenData = snapshot.val() || {};
  let lastSeenText = '';
  for (let user in lastSeenData) {
    if (user !== username) {
      const time = new Date(lastSeenData[user]);
      const hours = time.getHours().toString().padStart(2,'0');
      const mins = time.getMinutes().toString().padStart(2,'0');
      lastSeenText += `${user} last seen at ${hours}:${mins}\n`;
    }
  }
  typingIndicator.innerText = lastSeenText.trim() || typingIndicator.innerText;
});
