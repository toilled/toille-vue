import 'dart:async';
import 'dart:js_interop';
import 'dart:math' as math;
import 'package:web/web.dart';

// --- Global variables for Starfield ---
int score = 0;
HTMLCanvasElement? outerspace;
CanvasRenderingContext2D? mainContext;

int canvasWidth = 0;
int canvasHeight = 0;
double centerX = 0;
double centerY = 0;

int numberOfStars = 500;
final Map<String, ({HTMLCanvasElement round, HTMLCanvasElement spiky})> starAssets = {};
const int STAR_SIZE = 20;
const double HALF_STAR_SIZE = STAR_SIZE / 2;

final List<({String name, List<String> stops})> STAR_COLORS = [
  (name: 'white', stops: ['rgba(255, 255, 255, 1)', 'rgba(255, 255, 255, 0)']),
  (name: 'blue', stops: ['rgba(170, 191, 255, 1)', 'rgba(170, 191, 255, 0)']),
  (name: 'red', stops: ['rgba(255, 204, 170, 1)', 'rgba(255, 204, 170, 0)']),
  (name: 'yellow', stops: ['rgba(255, 255, 170, 1)', 'rgba(255, 255, 170, 0)']),
];

int getRandomInt(int min, int max) {
  return math.Random().nextInt(max - min + 1) + min;
}

double remap(double value, double istart, double istop, double ostart, double ostop) {
  return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
}

class Star {
  late double x;
  late double y;
  late double counter;
  late double radiusMax;
  late double speed;
  late double alpha;
  late bool isSpiky;
  late String colorName;
  late double twinkleOffset;

  double currentX = 0;
  double currentY = 0;
  double currentRadius = 0;

  Star() {
    reset(initial: true);
    // Overwrite initial counter to random position
    counter = getRandomInt(1, canvasWidth).toDouble();
  }

  void reset({bool initial = false}) {
    counter = canvasWidth.toDouble();
    x = getRandomInt((-centerX).toInt(), centerX.toInt()).toDouble();
    y = getRandomInt((-centerY).toInt(), centerY.toInt()).toDouble();

    if (initial) {
       radiusMax = 1 + math.Random().nextDouble() * 2;
       speed = getRandomInt(5, 10).toDouble();
       alpha = 0.7 + math.Random().nextDouble() * 0.3;
       twinkleOffset = math.Random().nextDouble() * math.pi * 2;
    } else {
       radiusMax = getRandomInt(1, 10).toDouble();
       speed = getRandomInt(1, 5).toDouble();
    }

    colorName = STAR_COLORS[math.Random().nextInt(STAR_COLORS.length)].name;
    isSpiky = math.Random().nextBool();
  }

  void drawStar() {
    counter -= speed;

    if (counter < 1) {
      reset();
    }

    double xRatio = x / counter;
    double yRatio = y / counter;

    double starX = remap(xRatio, 0, 1, 0, canvasWidth.toDouble());
    double starY = remap(yRatio, 0, 1, 0, canvasHeight.toDouble());

    double outerRadius = remap(counter, 0, canvasWidth.toDouble(), radiusMax, 0);

    if (outerRadius <= 0) return;

    currentX = starX;
    currentY = starY;
    currentRadius = outerRadius;

    double diameter = outerRadius * 2;

    double twinkle = math.sin(DateTime.now().millisecondsSinceEpoch * 0.003 + twinkleOffset) * 0.15;
    double currentAlpha = alpha + twinkle;
    if (currentAlpha < 0.2) currentAlpha = 0.2;
    if (currentAlpha > 1) currentAlpha = 1;

    if (mainContext != null) {
      mainContext!.globalAlpha = currentAlpha;

      HTMLCanvasElement img = isSpiky ? starAssets[colorName]!.spiky : starAssets[colorName]!.round;
      mainContext!.drawImage(img, starX - outerRadius, starY - outerRadius, diameter, diameter);

      mainContext!.globalAlpha = 1.0;
    }
  }
}

List<Star> stars = [];
late ShootingStar shootingStar;
late HTMLCanvasElement nebulaCanvas;
late CanvasRenderingContext2D nebulaContext;

class ShootingStar {
  double x = 0;
  double y = 0;
  double vx = 0;
  double vy = 0;
  bool active = false;
  double opacity = 0;

  void trigger() {
    if (active) return;
    active = true;
    opacity = 1;

    x = math.Random().nextDouble() * canvasWidth;
    y = math.Random().nextDouble() * canvasHeight;

    double angle = math.Random().nextDouble() * math.pi * 2;
    double speed = 15 + math.Random().nextDouble() * 10;
    vx = math.cos(angle) * speed;
    vy = math.sin(angle) * speed;
  }

  void draw() {
    if (!active) {
      if (math.Random().nextDouble() < 0.005) {
        trigger();
      }
      return;
    }

    x += vx;
    y += vy;
    opacity -= 0.015;

    if (opacity <= 0) {
      active = false;
      return;
    }

    if (mainContext != null) {
      mainContext!.beginPath();
      var gradient = mainContext!.createLinearGradient(x, y, x - vx * 3, y - vy * 3);
      gradient.addColorStop(0, 'rgba(255, 255, 255, $opacity)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      mainContext!.lineWidth = 2;
      mainContext!.strokeStyle = gradient;
      mainContext!.moveTo(x, y);
      mainContext!.lineTo(x - vx * 3, y - vy * 3);
      mainContext!.stroke();
    }
  }
}

void preRenderStars() {
  for (var color in STAR_COLORS) {
    // Round Star
    var roundStarCanvas = HTMLCanvasElement();
    roundStarCanvas.width = STAR_SIZE;
    roundStarCanvas.height = STAR_SIZE;
    var rCtx = roundStarCanvas.getContext('2d') as CanvasRenderingContext2D;

    var rGradient = rCtx.createRadialGradient(
        HALF_STAR_SIZE, HALF_STAR_SIZE, 0, HALF_STAR_SIZE, HALF_STAR_SIZE, HALF_STAR_SIZE);
    rGradient.addColorStop(0, color.stops[0]);
    rGradient.addColorStop(1, color.stops[1]);

    rCtx.fillStyle = rGradient;
    rCtx.beginPath();
    rCtx.arc(HALF_STAR_SIZE, HALF_STAR_SIZE, HALF_STAR_SIZE, 0, math.pi * 2);
    rCtx.fill();

    // Spiky Star
    var spikyStarCanvas = HTMLCanvasElement();
    spikyStarCanvas.width = STAR_SIZE;
    spikyStarCanvas.height = STAR_SIZE;
    var sCtx = spikyStarCanvas.getContext('2d') as CanvasRenderingContext2D;

    var sGradient = sCtx.createRadialGradient(
        HALF_STAR_SIZE, HALF_STAR_SIZE, 0, HALF_STAR_SIZE, HALF_STAR_SIZE, HALF_STAR_SIZE);
    sGradient.addColorStop(0, color.stops[0]);
    sGradient.addColorStop(1, color.stops[1]);

    sCtx.fillStyle = sGradient;

    double innerRadius = HALF_STAR_SIZE / 2;
    double outerRadius = HALF_STAR_SIZE;
    double rot = math.pi / 2 * 3;
    const int spikes = 5;
    double step = math.pi / spikes;

    sCtx.beginPath();
    sCtx.moveTo(HALF_STAR_SIZE, HALF_STAR_SIZE - outerRadius);

    for (int i = 0; i < spikes; i++) {
      double x = HALF_STAR_SIZE + math.cos(rot) * outerRadius;
      double y = HALF_STAR_SIZE + math.sin(rot) * outerRadius;
      sCtx.lineTo(x, y);
      rot += step;

      x = HALF_STAR_SIZE + math.cos(rot) * innerRadius;
      y = HALF_STAR_SIZE + math.sin(rot) * innerRadius;
      sCtx.lineTo(x, y);
      rot += step;
    }
    sCtx.lineTo(HALF_STAR_SIZE, HALF_STAR_SIZE - outerRadius);
    sCtx.closePath();
    sCtx.fill();

    starAssets[color.name] = (round: roundStarCanvas, spiky: spikyStarCanvas);
  }
}

void createNebula() {
  nebulaCanvas = HTMLCanvasElement();
  nebulaCanvas.width = canvasWidth;
  nebulaCanvas.height = canvasHeight;
  nebulaContext = nebulaCanvas.getContext('2d') as CanvasRenderingContext2D;

  var gradient = nebulaContext.createRadialGradient(
    canvasWidth * 0.5,
    canvasHeight * 0.5,
    0,
    canvasWidth * 0.5,
    canvasHeight * 0.5,
    canvasWidth * 0.6
  );
  gradient.addColorStop(0, 'rgba(100, 50, 150, 0.4)');
  gradient.addColorStop(0.5, 'rgba(50, 20, 100, 0.2)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  nebulaContext.fillStyle = gradient;
  nebulaContext.beginPath();
  nebulaContext.arc(canvasWidth * 0.5, canvasHeight * 0.5, canvasWidth * 0.6, 0, math.pi * 2);
  nebulaContext.fill();

  var secondGradient = nebulaContext.createRadialGradient(
    canvasWidth * 0.3,
    canvasHeight * 0.3,
    0,
    canvasWidth * 0.3,
    canvasHeight * 0.3,
    canvasWidth * 0.3
  );
  secondGradient.addColorStop(0, 'rgba(255, 100, 200, 0.3)');
  secondGradient.addColorStop(0.5, 'rgba(100, 150, 255, 0.1)');
  secondGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  nebulaContext.fillStyle = secondGradient;
  nebulaContext.beginPath();
  nebulaContext.arc(canvasWidth * 0.3, canvasHeight * 0.3, canvasWidth * 0.3, 0, math.pi * 2);
  nebulaContext.fill();
}

void draw(num _) {
  if (mainContext == null) return;

  mainContext!.fillStyle = "rgba(0, 0, 0, 0.3)".toJS;
  mainContext!.fillRect(0, 0, canvasWidth.toDouble(), canvasHeight.toDouble());

  mainContext!.drawImage(nebulaCanvas, 0, 0);

  mainContext!.translate(centerX, centerY);

  for (var star in stars) {
    star.drawStar();
  }

  mainContext!.translate(-centerX, -centerY);

  shootingStar.draw();

  window.requestAnimationFrame(draw.toJS);
}

void handleClick(MouseEvent event) {
  var rect = (event.target as HTMLCanvasElement).getBoundingClientRect();
  double clickX = (event.clientX - rect.left).toDouble();
  double clickY = (event.clientY - rect.top).toDouble();

  for (int i = stars.length - 1; i >= 0; i--) {
    var star = stars[i];
    double translatedClickX = clickX - centerX;
    double translatedClickY = clickY - centerY;

    double dx = translatedClickX - star.currentX;
    double dy = translatedClickY - star.currentY;
    double distance = math.sqrt(dx * dx + dy * dy);

    double hitRadius = math.max(star.currentRadius, 5);

    if (distance <= hitRadius) {
      score++;
      updateScore();
      break;
    }
  }
}

void updateScore() {
  Element? scoreElement = document.querySelector('.score-counter');
  if (scoreElement == null && score > 0) {
      scoreElement = document.createElement('div');
      scoreElement.className = 'score-counter';
      document.body!.append(scoreElement);
  }
  if (scoreElement != null) {
      scoreElement.textContent = 'Score: $score';
  }
}

void initStarfield() {
  outerspace = document.createElement('canvas') as HTMLCanvasElement;
  outerspace!.id = 'outerspace';

  // Style it
  outerspace!.style.position = 'fixed';
  outerspace!.style.top = '0';
  outerspace!.style.left = '0';
  outerspace!.style.width = '100%';
  outerspace!.style.height = '100%';
  outerspace!.style.zIndex = '-1';

  document.body!.append(outerspace!);

  mainContext = outerspace!.getContext('2d', {'alpha': false}.jsify()) as CanvasRenderingContext2D?;

  if (mainContext == null) return;

  outerspace!.width = window.innerWidth;
  outerspace!.height = window.innerHeight;

  canvasWidth = outerspace!.width;
  canvasHeight = outerspace!.height;

  centerX = canvasWidth * 0.5;
  centerY = canvasHeight * 0.5;

  preRenderStars();

  for (int i = 0; i < numberOfStars; i++) {
    stars.add(Star());
  }

  shootingStar = ShootingStar();

  createNebula();

  outerspace!.onClick.listen(handleClick);

  window.requestAnimationFrame(draw.toJS);

  EventStreamProviders.resizeEvent.forTarget(window).listen((Event _) {
    outerspace!.width = window.innerWidth;
    outerspace!.height = window.innerHeight;
    canvasWidth = outerspace!.width;
    canvasHeight = outerspace!.height;
    centerX = canvasWidth * 0.5;
    centerY = canvasHeight * 0.5;

    createNebula();
  });
}

void main() {
  initStarfield();

  // Minimal UI reproduction for verification that we have a working app
  // The original App.vue had a lot of components.
  // I will recreate the basic structure: Header, Title, etc.

  var mainElement = document.querySelector('main');
  if (mainElement != null) {
      mainElement.innerHTML = ''.toJS; // Clear "You need to enable JS"

      var header = document.createElement('header');
      var h2 = document.createElement('h2');
      h2.className = 'title';
      h2.textContent = 'Home (Dart Rewrite)';
      header.append(h2);
      mainElement.append(header);

      var p = document.createElement('p');
      p.textContent = 'This site has been completely rewritten in Dart.';
      mainElement.append(p);
  }
}
