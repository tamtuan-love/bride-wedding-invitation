import AppKit

let width = 1200
let height = 1400
let bitmap = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: width, pixelsHigh: height, bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: bitmap)
let skin = NSColor(calibratedRed: 0.94, green: 0.75, blue: 0.63, alpha: 1)
let hair = NSColor(calibratedRed: 0.24, green: 0.18, blue: 0.19, alpha: 1)
let red = NSColor(calibratedRed: 0.66, green: 0.14, blue: 0.22, alpha: 1)
let green = NSColor(calibratedRed: 0.45, green: 0.55, blue: 0.47, alpha: 1)
let white = NSColor(calibratedRed: 1, green: 0.99, blue: 0.97, alpha: 1)

func ellipse(_ left: CGFloat, _ bottom: CGFloat, _ sizeWidth: CGFloat, _ sizeHeight: CGFloat, _ color: NSColor) {
    color.setFill()
    NSBezierPath(ovalIn: NSRect(x: left, y: bottom, width: sizeWidth, height: sizeHeight)).fill()
}
func shape(_ points: [NSPoint], _ color: NSColor) {
    let path = NSBezierPath()
    path.move(to: points[0])
    for point in points.dropFirst() { path.line(to: point) }
    path.close()
    color.setFill()
    path.fill()
}
func line(_ points: [NSPoint], _ color: NSColor, _ thickness: CGFloat) {
    let path = NSBezierPath()
    path.move(to: points[0])
    for point in points.dropFirst() { path.line(to: point) }
    path.lineWidth = thickness
    path.lineCapStyle = .round
    path.lineJoinStyle = .round
    color.setStroke()
    path.stroke()
}
func flower(_ centerX: CGFloat, _ centerY: CGFloat, _ size: CGFloat) {
    for petal in 0..<5 {
        let angle = CGFloat(petal) * .pi * 2 / 5
        ellipse(centerX + cos(angle) * size * 0.48 - size * 0.4, centerY + sin(angle) * size * 0.48 - size * 0.4, size * 0.8, size * 0.8, petal % 2 == 0 ? NSColor(calibratedRed: 0.88, green: 0.54, blue: 0.61, alpha: 1) : NSColor(calibratedRed: 0.98, green: 0.81, blue: 0.82, alpha: 1))
    }
    ellipse(centerX - size * 0.17, centerY - size * 0.17, size * 0.34, size * 0.34, white)
}

ellipse(180, 95, 840, 100, NSColor(calibratedRed: 0.82, green: 0.78, blue: 0.76, alpha: 0.3))
let arch = NSBezierPath()
arch.move(to: NSPoint(x: 180, y: 170))
arch.line(to: NSPoint(x: 180, y: 760))
arch.curve(to: NSPoint(x: 1020, y: 760), controlPoint1: NSPoint(x: 180, y: 1340), controlPoint2: NSPoint(x: 1020, y: 1340))
arch.line(to: NSPoint(x: 1020, y: 170))
arch.lineWidth = 12
NSColor(calibratedRed: 0.76, green: 0.64, blue: 0.56, alpha: 1).setStroke()
arch.stroke()
for leafIndex in 0..<18 {
    let angle = CGFloat(leafIndex) / 17 * .pi
    let centerX = 600 + cos(angle) * 430
    let centerY = 780 + sin(angle) * 435
    ellipse(centerX - 25, centerY - 14, 68, 28, green)
    ellipse(centerX - 17, centerY + 15, 25, 60, green.withAlphaComponent(0.65))
    if leafIndex % 2 == 0 { flower(centerX, centerY, 43) }
}
for side in [CGFloat(160), CGFloat(985)] {
    for leafIndex in 0..<5 {
        ellipse(side, 170 + CGFloat(leafIndex) * 65, 57, 24, green)
        flower(side + 20, 195 + CGFloat(leafIndex) * 65, 28)
    }
}

shape([NSPoint(x: 365, y: 440), NSPoint(x: 465, y: 440), NSPoint(x: 445, y: 150), NSPoint(x: 368, y: 150)], hair)
shape([NSPoint(x: 475, y: 440), NSPoint(x: 570, y: 440), NSPoint(x: 573, y: 150), NSPoint(x: 493, y: 150)], hair)
ellipse(342, 127, 112, 48, hair)
ellipse(481, 127, 113, 48, hair)
shape([NSPoint(x: 350, y: 750), NSPoint(x: 575, y: 750), NSPoint(x: 590, y: 430), NSPoint(x: 340, y: 430)], NSColor(calibratedRed: 0.34, green: 0.38, blue: 0.36, alpha: 1))
shape([NSPoint(x: 407, y: 757), NSPoint(x: 514, y: 757), NSPoint(x: 461, y: 500)], white)
shape([NSPoint(x: 460, y: 729), NSPoint(x: 429, y: 750), NSPoint(x: 429, y: 710)], red)
shape([NSPoint(x: 460, y: 729), NSPoint(x: 491, y: 750), NSPoint(x: 491, y: 710)], red)
line([NSPoint(x: 360, y: 709), NSPoint(x: 305, y: 543), NSPoint(x: 333, y: 433)], NSColor(calibratedRed: 0.34, green: 0.38, blue: 0.36, alpha: 1), 58)
line([NSPoint(x: 562, y: 709), NSPoint(x: 601, y: 535), NSPoint(x: 650, y: 528)], NSColor(calibratedRed: 0.34, green: 0.38, blue: 0.36, alpha: 1), 55)
ellipse(311, 398, 45, 58, skin)
ellipse(622, 508, 62, 43, skin)
ellipse(353, 785, 222, 235, hair)
ellipse(363, 772, 204, 215, skin)
ellipse(350, 925, 213, 85, hair)
ellipse(353, 875, 35, 99, hair)
ellipse(535, 884, 28, 87, hair)

let veil = NSBezierPath()
veil.move(to: NSPoint(x: 650, y: 970))
veil.curve(to: NSPoint(x: 928, y: 260), controlPoint1: NSPoint(x: 930, y: 1080), controlPoint2: NSPoint(x: 887, y: 515))
veil.line(to: NSPoint(x: 607, y: 260))
veil.close()
NSColor(calibratedRed: 1, green: 1, blue: 1, alpha: 0.7).setFill()
veil.fill()
ellipse(615, 774, 220, 250, hair)
shape([NSPoint(x: 660, y: 713), NSPoint(x: 796, y: 713), NSPoint(x: 844, y: 453), NSPoint(x: 949, y: 173), NSPoint(x: 556, y: 173), NSPoint(x: 645, y: 469)], white)
line([NSPoint(x: 670, y: 643), NSPoint(x: 623, y: 547), NSPoint(x: 665, y: 500)], skin, 38)
line([NSPoint(x: 785, y: 643), NSPoint(x: 832, y: 547), NSPoint(x: 760, y: 510)], skin, 38)
ellipse(630, 778, 193, 210, skin)
ellipse(627, 938, 192, 77, hair)
ellipse(622, 864, 33, 111, hair)
ellipse(799, 868, 27, 100, hair)
line([NSPoint(x: 659, y: 996), NSPoint(x: 800, y: 996)], white, 14)
for flowerIndex in 0..<5 { flower(658 + CGFloat(flowerIndex) * 34, 994, 15) }
for faceX in [CGFloat(363), CGFloat(630)] {
    ellipse(faceX + 55, 886, 12, 19, hair)
    ellipse(faceX + 127, 886, 12, 19, hair)
    ellipse(faceX + 28, 858, 35, 16, NSColor(calibratedRed: 0.88, green: 0.48, blue: 0.48, alpha: 0.45))
    ellipse(faceX + 142, 858, 35, 16, NSColor(calibratedRed: 0.88, green: 0.48, blue: 0.48, alpha: 0.45))
    let smile = NSBezierPath()
    smile.move(to: NSPoint(x: faceX + 83, y: 856))
    smile.curve(to: NSPoint(x: faceX + 116, y: 856), controlPoint1: NSPoint(x: faceX + 89, y: 840), controlPoint2: NSPoint(x: faceX + 109, y: 840))
    smile.lineWidth = 4
    hair.setStroke()
    smile.stroke()
}
for stemIndex in 0..<5 {
    line([NSPoint(x: 714, y: 453), NSPoint(x: 665 + CGFloat(stemIndex) * 22, y: 577)], green, 7)
    ellipse(664 + CGFloat(stemIndex) * 13, 510, 25, 56, green)
    flower(658 + CGFloat(stemIndex) * 27, 582 + CGFloat(stemIndex % 2) * 25, 30)
}
ellipse(681, 469, 50, 34, skin)
NSGraphicsContext.restoreGraphicsState()
let output = URL(fileURLWithPath: CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : "images/couple-default.png")
try bitmap.representation(using: .png, properties: [:])!.write(to: output)
print("Generated original couple illustration: \(output.path)")