import type { Scenes } from "telegraf";
import type { Alert } from "./alert";

type SceneState = {
	alert: Alert;
	step: string | null;
	page: number;
};

declare module "telegraf" {
	interface Context {
		scene: Scenes.SceneContextScene<Context> & { state: SceneState };
		session: Scenes.SceneSession & { __scenes?: { state?: SceneState } };
	}
}
