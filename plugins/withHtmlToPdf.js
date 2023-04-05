const { withAppBuildGradle } = require('@expo/config-plugins');

module.exports = (expoConfig) => {
  return withAppBuildGradle(expoConfig, (modConfig) => {
    // console.log(JSON.stringify(modConfig.modResults));
    const newBuildGradle = `
    configurations.all {
      c -> c.resolutionStrategy.eachDependency {
        DependencyResolveDetails dependency ->
            println dependency.requested.group
            if (dependency.requested.group == 'org.bouncycastle') {
                dependency.useTarget 'org.bouncycastle:bcprov-jdk15to18:1.68'
            }
      }
    }
    `;
    modConfig.modResults.contents = modConfig.modResults.contents.replace(
      /android\s?{/,
      `android {\n${newBuildGradle}\n`
    );
    return modConfig;
  });
};
