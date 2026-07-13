import re

# 1. Update js/main.js (Remove initProductCarousel)
with open('js/main.js', 'r', encoding='utf-8') as f:
    main_js = f.read()

# The function goes from (function initProductCarousel() to })();
# Let's remove it completely.
main_js = re.sub(r'// ─── Carrossel Infinito de Produtos ─────────────────────────\n\(function initProductCarousel\(\) \{.*?\n\}\)\(\);\n', '', main_js, flags=re.DOTALL)

with open('js/main.js', 'w', encoding='utf-8') as f:
    f.write(main_js)


# 2. Update index.html (Remove inline duplication JS and update container class)
with open('index.html', 'r', encoding='utf-8') as f:
    index_html = f.read()

# Replace the duplication logic:
old_logic = """      // A duplicação para efeito infinito é feita via JS em main.js
      if (querySnapshot.size > 2) {
        track.innerHTML = html;
      } else {
        track.innerHTML = html;
        // Ajustando CSS local para não animar se houver poucos produtos
        track.style.animation = 'none';
        track.style.display = 'flex';
        track.style.justifyContent = 'center';
      }"""

new_logic = """      // Apenas injeta os produtos na grid
      track.innerHTML = html;"""

index_html = index_html.replace(old_logic, new_logic)

# Replace the classes to be a grid
index_html = index_html.replace('class="carousel-track-wrap" id="carouselWrap"', 'class="products-grid-wrap"')
index_html = index_html.replace('class="carousel-track" id="carouselTrack"', 'class="products-grid" id="productsGrid"')

# Change the JS reference from carouselTrack to productsGrid
index_html = index_html.replace("document.getElementById('carouselTrack')", "document.getElementById('productsGrid')")
index_html = index_html.replace("track.innerHTML", "productsGrid.innerHTML")
index_html = index_html.replace("const track =", "const productsGrid =")

# Remove carousel hints
hint_regex = r'<!-- Indicador de rolagem -->.*?<p class="carousel-hint".*?</p>'
index_html = re.sub(hint_regex, '', index_html, flags=re.DOTALL)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(index_html)


# 3. Update css/style.css (Remove carousel animation, add Grid and Hover effect)
with open('css/style.css', 'r', encoding='utf-8') as f:
    style_css = f.read()

# We will just append the new grid styles and override the card hover
new_css = """
/* GRID DE PRODUTOS */
.products-grid-wrap {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  justify-content: center;
}

/* HOVER EFFECT NO CARD */
.carousel-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  border: 1px solid #EDEDED;
}
.carousel-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.12);
}
"""
style_css += new_css

with open('css/style.css', 'w', encoding='utf-8') as f:
    f.write(style_css)

print("Updates applied.")
