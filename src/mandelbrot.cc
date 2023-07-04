// g++ mandelbrot.cc -o mandelbrot -O3 -std=c++17 -lpng
#include "png++/png.hpp"
#include <iostream>
#include <string>
#include <vector>
#include <filesystem>

using std::cout;
using std::endl;
using std::min;
using std::max;
using std::to_string;
using std::string;
using std::vector;
namespace fs = std::filesystem;

#define HEIGHT 1080
#define WIDTH 1920
#define SCALAR 1.28402541669  // e^(1/4)
#define REAL 0.3388866579009341
#define IMAG 0.5735275233665983
#define BAILOUT 1024
#define DIR "../images/mandelbrot/"

int main() {
  fs::create_directory(DIR);
  for (int i = 0; i < 140; i++) {
    string filename = to_string(i) + ".png";
    double left = 0.9 - 0.25 * pow(0.9, i);
    double top = 0.2 + 0.14 * pow(0.9, i);
    long double zoom = pow(SCALAR, i);
    int max_itr = 60000 * pow(zoom, 0.08) - 59000;
    int percent = 0;
    png::image<png::rgb_pixel> image = png::image<png::rgb_pixel>(WIDTH, HEIGHT);
    for (int i = 0; i < HEIGHT; i++) {
      for (int j = 0; j < WIDTH; j++) {
        long double c_r = 4.0 * (j - left * WIDTH) / min(WIDTH, HEIGHT) / zoom + REAL;
        long double c_i = 4.0 * (top * HEIGHT - i) / min(WIDTH, HEIGHT) / zoom + IMAG;
        long double z_r = 0.0;
        long double z_i = 0.0;
        long double z_r2 = 0.0;
        long double z_i2 = 0.0;
        for (int itr = 0; itr < max_itr; itr++) {
          z_i = 2.0 * z_r * z_i + c_i;
          z_r = z_r2 - z_i2 + c_r;
          z_r2 = z_r * z_r;
          z_i2 = z_i * z_i;
          if (z_r2 + z_i2 > BAILOUT * BAILOUT) {
            double itr_cont = itr + 1.0 - log2(0.5 * log(z_r2 + z_i2) / log(BAILOUT));
            int c = 128 * sin(1.4 * log(itr_cont)) + 128;
            image[i][j] = png::rgb_pixel(c, c, c);
            break;
          }
        }
        if (100.0 * (i * WIDTH + j + 1) / (HEIGHT * WIDTH) - percent >= 1.0) {
          percent++;
          cout << filename + ": " + to_string(percent) + "%" << endl;
        }
      }
    }
    image.write(DIR + filename);
    cout << filename + ": done!" << endl;
  }
  return EXIT_SUCCESS;
}
