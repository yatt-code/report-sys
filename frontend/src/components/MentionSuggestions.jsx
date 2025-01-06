import React from 'react';

export function MentionSuggestions({ suggestions, onSelect }) {
  if (!suggestions.length) return null;

  return (
    <div className="mention-suggestions">
      {suggestions.map(user => (
        <div
          key={user.id}
          className="mention-suggestion-item"
          onClick={() => onSelect(user)}
        >
          {user.username}
        </div>
      ))}
    </div>
  );
}

// Update your text input components to handle mentions
function handleContentChange(e) {
  const text = e.target.value;
  setContent(text);

  // Check for @ symbol
  const lastAtSymbol = text.lastIndexOf('@');
  if (lastAtSymbol !== -1) {
    const query = text.slice(lastAtSymbol + 1).split(' ')[0];
    if (query) {
      // Fetch user suggestions
      api.users.search(query).then(users => {
        setSuggestions(users);
      });
    }
  }
}