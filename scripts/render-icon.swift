// Renders an app bundle's icon via IconServices. Used by export-icon.sh.
import AppKit
dlopen("/System/Library/PrivateFrameworks/IconServices.framework/IconServices", RTLD_NOW)
// usage: render2 <app> <out.png> <appearance> <variant> <size>
let a = CommandLine.arguments
let iconClass = NSClassFromString("ISIcon") as! NSObject.Type
let descClass = NSClassFromString("ISImageDescriptor") as! NSObject.Type
let icon = iconClass.perform(NSSelectorFromString("alloc")).takeUnretainedValue()
  .perform(NSSelectorFromString("initWithURL:"), with: URL(fileURLWithPath: a[1]) as NSURL).takeUnretainedValue() as! NSObject
let size = Double(a[5])!
let desc = descClass.init()
desc.setValue(NSValue(size: NSSize(width: size, height: size)), forKey: "size")
desc.setValue(1.0, forKey: "scale")
desc.setValue(Int(a[3])!, forKey: "appearance")
desc.setValue(Int(a[4])!, forKey: "appearanceVariant")
desc.setValue(true, forKey: "ignoreCache")
typealias GetFn = @convention(c) (AnyObject, Selector, AnyObject, @escaping @convention(block) (CGImage?) -> Void) -> Void
let gsel = NSSelectorFromString("getCGImageForImageDescriptor:completion:")
let gfn = unsafeBitCast(icon.method(for: gsel), to: GetFn.self)
var result: CGImage?
var done = false
gfn(icon, gsel, desc) { img in result = img; done = true }
let deadline = Date().addingTimeInterval(15)
while !done && Date() < deadline { RunLoop.current.run(until: Date().addingTimeInterval(0.05)) }
guard let cg = result else { print("nil image"); exit(1) }
let rep = NSBitmapImageRep(cgImage: cg)
try! rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: a[2]))
print(cg.width, cg.height)
