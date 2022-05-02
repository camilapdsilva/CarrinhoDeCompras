const fetchProducts = async (tipo) => {
  const URL = `https://api.mercadolibre.com/sites/MLB/search?q=${tipo}`;
  try {
    const promise = await fetch(URL);
    const data = await promise.json();
    return data;
  } catch (error) {
    console.log('You must provide an url', error);
  }
};

const fetchItem = async (ItemID) => {
  const url = `https://api.mercadolibre.com/items/${ItemID}`;
  try {
    const itens = await fetch(url);
    const data = await itens.json();
    return data;
  } catch (error) {
    console.log('You must provide an url', error);
  }
};

const getSavedCartItems = (element) => localStorage.getItem(element);

const saveCartItems = (cart) => localStorage.setItem('cartItems', cart);

const cart = document.querySelector('.cart__items');

const totalCart = document.querySelector('.total-price');

const somaCarrinho = async () => {
  const cartItem = document.querySelectorAll('.cart_price');
  let total = 0;
  if (cartItem.length === 0) {
    totalCart.innerText = '';
  }

  cartItem.forEach((elem) => {
    const precos = elem.innerText;
    const valor = precos.split('R$')[1].replace('.', '').replace(',', '.');
    console.log(valor);
    total += parseFloat(valor);
  });

  const valorFormatado = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  totalCart.innerText = valorFormatado;
};

const botaoEsvaziar = document.querySelector('.empty-cart');
botaoEsvaziar.addEventListener('click', () => {
  cart.innerHTML = '';
  somaCarrinho();
  localStorage.removeItem('cartItems');
});

function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
}

function cartItemClickListener(event) {
  if (event.target.className === 'cart_remove') {
    event.target.parentNode.remove();
  }
  saveCartItems(cart.innerHTML);
  somaCarrinho();
}

function createCartItemElement({ id: sku, title: name, price: salePrice, thumbnail: image }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.appendChild(createProductImageElement(image));
  li.appendChild(createCustomElement('span', 'cart_sku', sku));
  const item = document.createElement('span');
  item.appendChild(createCustomElement('span', 'cart_name', name));
  const valorFormatado = salePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  item.appendChild(createCustomElement('span', 'cart_price', valorFormatado));
  li.appendChild(item);
  li.appendChild(createCustomElement('button', 'cart_remove', 'X'));
  const botaoRemover = li.querySelector('.cart_remove');
  botaoRemover.addEventListener('click', cartItemClickListener);

  return li;
}

const createCartItem = async (event) => {
  const itens = await fetchItem(event.target.parentNode.firstChild.innerText);
  const { id, title, price, thumbnail } = itens;
  const elementos = createCartItemElement({ id, title, price, thumbnail });
  cart.appendChild(elementos);
  saveCartItems(cart.innerHTML);
  somaCarrinho();
};

function createProductItemElement({ sku, name, image, salePrice }) {
  const section = document.createElement('section');
  section.className = 'item';
  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));
  const valorFormatado = salePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  section.appendChild(createCustomElement('span', 'item__preco', valorFormatado));
  section.appendChild(createCustomElement('button', 'item__add', 'Adicionar ao carrinho!'))
    .addEventListener('click', createCartItem);
  somaCarrinho();
  return section;
}

// Função que não utilizei para o requisito 2
// function getSkuFromProductItem(item) {
//   return item.querySelector('span.item__sku').innerText;
// }

const criaProduct = async (item) => {
  const product = await fetchProducts(item);
  const produtos = product.results.map((elem) => {
    const { id: sku, title: name, thumbnail: image, price: salePrice } = elem;
    return { sku, name, image, salePrice };
  });
  return produtos;
};

const addLocalStorage = () => {
  const local = getSavedCartItems('cartItems');
  cart.innerHTML = local;
  cart.addEventListener('click', cartItemClickListener);
};

const carregando = () => {
  const localCarrega = document.querySelector('body');
  localCarrega.appendChild(createCustomElement('div', 'loading', 'Carregando...'));
};
carregando();

const preCarregamento = () => {
  const preCarrega = document.querySelector('.loading');
  preCarrega.remove();
};

window.onload = async () => {
  const products = await criaProduct('computador');
  const ul = document.querySelector('.items');
  products.forEach((elemento) => {
    ul.appendChild(createProductItemElement(elemento));
  });
  preCarregamento();
  addLocalStorage();
  somaCarrinho();
};
