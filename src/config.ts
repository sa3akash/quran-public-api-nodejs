class Config {
  public readonly PORT: string = process.env.PORT || "3000";

  public validate() {
    for (const [key, value] of Object.entries(this)) {
      if (value === undefined) {
        throw new Error(`Configuration ${key} is undefined`);
      }
    }
  }
}

export const config = new Config();
