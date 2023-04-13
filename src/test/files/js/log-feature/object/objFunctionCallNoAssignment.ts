// @ts-nocheck

function myFunc() {
  this.subscriptions.add(
    this.someService.someVar.subscribe((next) => {
      this.mode = next;
      if (this.mode === SomeModes.Mode) {
        this.cool = "true" === localStorage.getItem(something);
        const panel = this.fancyPanel ? "expanded" : "collapsed";
        (window as any)._uxa?.push([
          "trackDynamicVariable",
          { key: "side-panel-display", value: sidePanelMode },
        ]);
      }
    })
  );
}
