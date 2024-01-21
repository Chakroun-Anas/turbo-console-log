// @ts-nocheck

function someFunc() {
  this.subscription = this.userService.currentUser.subscribe(
    (userData: User) => {
      this.canModify = userData.username === this.comment.author.username;
    },
  );
}
