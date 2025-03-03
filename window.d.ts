type App = {
  state: {
    create: {
      step: number;
    };
  };
};

interface Window {
  App: App;
}

