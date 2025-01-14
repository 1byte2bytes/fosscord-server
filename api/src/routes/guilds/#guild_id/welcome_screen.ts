import { Request, Response, Router } from "express";
import { Guild, getPermission, Snowflake, Member } from "@fosscord/util";
import { HTTPError } from "lambert-server";

import { check } from "../../../util/instanceOf";
import { GuildUpdateWelcomeScreenSchema } from "../../../schema/Guild";

const router: Router = Router();

router.get("/", async (req: Request, res: Response) => {
	const guild_id = req.params.guild_id;

	const guild = await Guild.findOneOrFail({ id: guild_id });

	await Member.IsInGuildOrFail(req.user_id, guild_id);

	res.json(guild.welcome_screen);
});

router.patch("/", check(GuildUpdateWelcomeScreenSchema), async (req: Request, res: Response) => {
	const guild_id = req.params.guild_id;
	const body = req.body as GuildUpdateWelcomeScreenSchema;

	const guild = await Guild.findOneOrFail({ id: guild_id });

	const perms = await getPermission(req.user_id, guild_id);
	perms.hasThrow("MANAGE_GUILD");

	if (!guild.welcome_screen.enabled) throw new HTTPError("Welcome screen disabled", 400);
	if (body.welcome_channels) guild.welcome_screen.welcome_channels = body.welcome_channels; // TODO: check if they exist and are valid
	if (body.description) guild.welcome_screen.description = body.description;
	if (body.enabled != null) guild.welcome_screen.enabled = body.enabled;

	res.sendStatus(204);
});

export default router;
