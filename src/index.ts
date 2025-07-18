import {
  AppServer,
  AppSession,
  BitmapUtils,
  AnimationUtils,
  ViewType,
} from "@mentra/sdk";

const PACKAGE_NAME =
  process.env.PACKAGE_NAME ??
  (() => {
    throw new Error("PACKAGE_NAME is not set in .env file");
  })();
const MENTRAOS_API_KEY =
  process.env.MENTRAOS_API_KEY ??
  (() => {
    throw new Error("MENTRAOS_API_KEY is not set in .env file");
  })();
const PORT = parseInt(process.env.PORT || "3000");

class BitmapAnimationDemo extends AppServer {
  constructor() {
    super({
      packageName: PACKAGE_NAME,
      apiKey: MENTRAOS_API_KEY,
      port: PORT,
    });
  }

  protected override async onSession(
    session: AppSession,
    sessionId: string,
    userId: string
  ): Promise<void> {
    console.log(`Session started for user: ${userId}, sessionId: ${sessionId}`);

    try {

      const frameBase64 = await BitmapUtils.loadBmpFromFileAsBase64(
        "./assets/bitmap-test2.bmp"
      );
      const validation = BitmapUtils.validateBmpBase64(frameBase64);
      if (!validation.isValid) {
        console.error(
          `❌ Frame validation failed: ${validation.errors.join(", ")}`
        );
        session.layouts.showTextWall("❌ Error: Invalid bitmap data");
        return;
      }
      
      session.layouts.showBitmapView(frameBase64, { view: ViewType.MAIN });
    } catch (error) {
      console.error("Demo error:", error);
    }

    // Session lifecycle management
    session.events.onDisconnected(() => {
      console.log(`👋 Session ${sessionId} disconnected for user ${userId}`);
    });

    session.events.onError((error) => {
      console.error(`❌ Session ${sessionId} error:`, error);
    });

    // Graceful shutdown handling
    const cleanup = () => {
      console.log(`🧹 Cleaning up session ${sessionId}`);
    };

    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);
  }
}

// Start the MentraOS Bitmap Animation Demo
const app = new BitmapAnimationDemo();
app.start().catch(console.error);

