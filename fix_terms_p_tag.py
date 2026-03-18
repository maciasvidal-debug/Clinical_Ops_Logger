import re

with open('app/terms/page.tsx', 'r') as f:
    content = f.read()

# The regex replacement incorrectly moved the closing </p> of section 9 to the end of the new section.
# Let's fix this by finding the broken closing p tag at the end and putting it back to section 9.

# Find the end of section 9
old_section = "Este contrato se rige por las leyes de la República de Chile. Para cualquier controversia, las partes fijan su domicilio en la comuna de Providencia, sometiéndose a la competencia de sus Tribunales Ordinarios de Justicia, sin perjuicio de los derechos irrenunciables del consumidor de demandar en el tribunal correspondiente a su propio domicilio."

content = content.replace(old_section, old_section + "\n            </p>")
content = content.replace("</p>\n          </div>\n        </div>\n      </div>\n    </div>\n  );\n}", "\n          </div>\n        </div>\n      </div>\n    </div>\n  );\n}")

with open('app/terms/page.tsx', 'w') as f:
    f.write(content)
