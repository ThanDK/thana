package in.thanadon.foodiesapi.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import in.thanadon.foodiesapi.io.FoodRequest;
import in.thanadon.foodiesapi.io.FoodRespond;
import in.thanadon.foodiesapi.service.FoodService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

//ในกรณีที่ไม่มี Spring มาเกี่ยวข้อง เราสามารถใช้ FoodService ได้โดยตรงเหมือนกับการใช้คลาสทั่วไป แต่จะต้องสร้างอินสแตนซ์ของคลาสที่เป็น FoodService และกำหนดการทำงานในคลาสนั้นเอง โดยที่ FoodService เป็นแค่ interface ซึ่งไม่สามารถใช้งานได้โดยตรง เพราะไม่สามารถมี method implementation ในตัวเองได้
//
//        ตัวอย่าง:
//
//หากเราไม่มี Spring และต้องการใช้ FoodService เราจะต้องทำการสร้าง FoodServiceImpl และใช้ method ของมัน
//
//public interface FoodService {
//    void addFood(String food);
//}
//
//public class FoodServiceImpl implements FoodService {
//    @Override
//    public void addFood(String food) {
//        System.out.println("Food added: " + food);
//    }
//}
//
//public class Main {
//    public static void main(String[] args) {
//        FoodService foodService = new FoodServiceImpl();  // สร้าง FoodServiceImpl
//        foodService.addFood("Pizza");  // ใช้งาน method addFood
//    }
//}
//ในกรณีนี้เราต้องสร้าง FoodServiceImpl และเรียกใช้งาน method ผ่านอ็อบเจกต์ที่สร้างขึ้นจากคลาสนั้นโดยตรง
//
//กับ Spring Framework:
//
//เมื่อใช้ Spring เราจะไม่ต้องสร้างอ็อบเจกต์เองหรือใช้ new FoodServiceImpl() เนื่องจาก Spring จะทำการ inject อ็อบเจกต์ FoodServiceImpl ให้โดยอัตโนมัติ
//
//ด้วยการใช้ @RestController และ @AllArgsConstructor Spring จะจัดการสร้าง FoodServiceImpl และ inject เข้ามาใน FoodController โดยอัตโนมัติ ซึ่งทำให้โค้ดสะดวกและยืดหยุ่นกว่า

//@RestController
//@RequestMapping("/api/foods")
//@AllArgsConstructor
//public class FoodController {
//    private final FoodService foodService;  // Spring จะ inject FoodServiceImpl เข้าไปที่นี่
//
//    @PostMapping
//    public void addFood(@RequestPart("food") String foodString) {
//        foodService.addFood(foodString);  // ใช้งาน method addFood จาก FoodServiceImpl
//    }
//}
//ในกรณีนี้ Spring จะทำการ inject FoodServiceImpl ให้กับ foodService โดยอัตโนมัติจาก ApplicationContext แทนที่เราจะต้องสร้างมันเองแบบในตัวอย่างแรก
//
@RestController
@RequestMapping("/api/foods")
@AllArgsConstructor
@CrossOrigin("*")
public class FoodController {

    private final FoodService foodService;

    @PostMapping
    public FoodRespond addFood(@RequestPart("food") String foodString,
                               @RequestPart("file") MultipartFile file) {
        // สร้าง ObjectMapper สำหรับแปลง String ไปเป็น FoodRequest
        ObjectMapper objectMapper = new ObjectMapper();
        FoodRequest request = null;
        try {
            // แปลง JSON String ไปเป็น FoodRequest
            request = objectMapper.readValue(foodString, FoodRequest.class);
        } catch (JsonProcessingException ex) {
            // ถ้าแปลงข้อมูลไม่ได้จะส่งกลับคำขอที่ผิดพลาด
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid json");
        }

        // เรียกใช้ service เพื่อเพิ่มข้อมูลอาหาร
        FoodRespond response = foodService.addFood(request, file);
        // ส่งผลลัพธ์กลับไปยังผู้เรียก
        return response;
    }

    @GetMapping
    public List<FoodRespond> readFoods() {
        return foodService.readFoods();
    }

    @GetMapping("/{id}")
    public FoodRespond readFood(@PathVariable String id) {
        return foodService.readFood(id);
    }
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteFood(@PathVariable String id) {
        foodService.deleteFood(id);
    }
}
