declare module "@react-navigation/bottom-tabs" {
  import type { ParamListBase } from "@react-navigation/native";
  import type { ComponentType } from "react";

  export function createBottomTabNavigator<ParamList extends ParamListBase = ParamListBase>(): {
    Navigator: ComponentType<any>;
    Screen: ComponentType<{ name: keyof ParamList } & Record<string, unknown>>;
  };
}
