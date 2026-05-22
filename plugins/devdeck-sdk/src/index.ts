// DevDeck Plugin SDK
// Use this package to build DevDeck plugins.

export type {
  DevDeckAction,
  DevDeckWidget,
  ActionContext,
  WidgetProps,
  PluginSDK,
} from "../../../src/plugins/sdk/types";

export function definePlugin(
  factory: (sdk: import("../../../src/plugins/sdk/types").PluginSDK) => void | Promise<void>
) {
  return factory;
}
