// @ts-nocheck

function someFunc() {
  this.subscription = this.userService.currentUser.subscribe(
    (userData: User) => {
      this.canModify = userData.username === this.comment.author.username;
    },
  );
}

for (const flag of filteredFlags) {
  const values = FLAG_COLUMNS.reduce((acc, key) => {
    acc[key] = FLAG_CONFIG[key](flag);
    return acc;
  }, {});
}
